
from __future__ import annotations
from typing import List, Optional, Dict
from datetime import datetime
from app.domain.models import Conversation

class InMemoryConversationStore:
    def __init__(self):
        self._convs: Dict[str, Conversation] = {}
        self._open_by_customer: Dict[str, str] = {}

    def all(self) -> List[Conversation]:
        return list(self._convs.values())

    def find_open_by_customer(self, customer_id: str) -> Optional[Conversation]:
        cid = self._open_by_customer.get(customer_id)
        if not cid:
            return None
        c = self._convs.get(cid)
        if c and c.closed_at is None:
            return c
        return None

    def open(self, conv: Conversation) -> None:
        self._convs[conv.id] = conv
        self._open_by_customer[conv.customer_id] = conv.id

    def close(self, conv_id: str, closed_at: datetime) -> None:
        c = self._convs.get(conv_id)
        if c:
            c.closed_at = closed_at
            # remove from open index if it points here
            if self._open_by_customer.get(c.customer_id) == conv_id:
                self._open_by_customer.pop(c.customer_id, None)

    def upsert_first_received(self, conv_id: str, when: datetime) -> None:
        c = self._convs.get(conv_id)
        if c and c.first_received_at is None:
            c.first_received_at = when

    def upsert_first_response(self, conv_id: str, when: datetime) -> None:
        c = self._convs.get(conv_id)
        if c and c.first_response_at is None:
            c.first_response_at = when
