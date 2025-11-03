
from __future__ import annotations
from typing import List
from app.domain.models import Message

class InMemoryMessageStore:
    def __init__(self):
        self._msgs: List[Message] = []

    def all(self) -> List[Message]:
        return list(self._msgs)

    def add(self, msg: Message) -> None:
        self._msgs.append(msg)
