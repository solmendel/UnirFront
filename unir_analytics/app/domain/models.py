
from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from typing import Optional
from datetime import datetime, timezone, timedelta

class Channel(str, Enum):
    whatsapp = "whatsapp"
    instagram = "instagram"
    gmail = "gmail"

@dataclass
class Message:
    channel: Channel
    sender: str
    text: str
    timestamp: datetime
    outgoing: bool = False
    agent_id: Optional[str] = None
    tag: Optional[str] = None

@dataclass
class Conversation:
    id: str
    customer_id: str
    opened_at: datetime
    first_received_at: Optional[datetime] = None
    first_response_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    channel: Optional[Channel] = None
    assigned_agent_id: Optional[str] = None
    main_tag: Optional[str] = None

    def frt_minutes(self) -> Optional[int]:
        if self.first_received_at and self.first_response_at:
            delta = self.first_response_at - self.first_received_at
            return int(delta.total_seconds() // 60)
        return None
