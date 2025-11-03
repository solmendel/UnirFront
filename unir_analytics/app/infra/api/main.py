
from __future__ import annotations
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from pydantic import BaseModel, Field
from typing import Optional

from app.domain.models import Channel, Message, Conversation
from app.bootstrap import msg_store, conv_store, analytics_service

app = FastAPI(title="UNIR Analytics (Python)")

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Puerto alternativo de Vite
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MessageIn(BaseModel):
    channel: Channel
    sender: str
    message: str = Field(default="")
    timestamp: str
    outgoing: bool = False
    agent_id: Optional[str] = None
    tag: Optional[str] = None

@app.post("/messages")
def ingest_message(payload: MessageIn):
    # Parse timestamp as aware datetime
    ts = datetime.fromisoformat(payload.timestamp.replace("Z","+00:00"))
    if ts.tzinfo is None:
        ts = ts.replace(tzinfo=timezone.utc)
    # Ensure conversation exists/open
    conv = conv_store.find_open_by_customer(payload.sender)
    if conv is None:
        conv_id = f"conv:{payload.sender}:{int(ts.timestamp())}"
        conv = Conversation(id=conv_id, customer_id=payload.sender, opened_at=ts, channel=payload.channel)
        conv_store.open(conv)
        if not payload.outgoing:
            conv_store.upsert_first_received(conv_id, ts)

    # If first OUT for this conv, set first_response_at
    if payload.outgoing:
        conv_store.upsert_first_response(conv.id, ts)

    # Store message
    msg = Message(
        channel=payload.channel,
        sender=payload.sender,
        text=payload.message,
        timestamp=ts,
        outgoing=payload.outgoing,
        agent_id=payload.agent_id,
        tag=payload.tag,
    )
    msg_store.add(msg)
    return {"ok": True}

@app.get("/analytics/dashboard")
def dashboard():
    return analytics_service.dashboard()
