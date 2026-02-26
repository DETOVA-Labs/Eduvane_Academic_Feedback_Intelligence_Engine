from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Literal

Role = Literal["TEACHER", "STUDENT", "UNKNOWN"]


@dataclass
class SessionState:
    role: Role = "UNKNOWN"
    asked_role_clarification: bool = False
    turns: List[dict] = field(default_factory=list)
    learning_gaps: List[str] = field(default_factory=list)


class SessionMemory:
    def __init__(self) -> None:
        self._sessions: Dict[str, SessionState] = {}

    def get(self, session_id: str) -> SessionState:
        if session_id not in self._sessions:
            self._sessions[session_id] = SessionState()
        return self._sessions[session_id]

    def set_role(self, session_id: str, role: Role) -> None:
        state = self.get(session_id)
        state.role = role

    def remember_gaps(self, session_id: str, gaps: List[str]) -> None:
        state = self.get(session_id)
        unique = [gap for gap in gaps if gap]
        state.learning_gaps = unique[:5]

    def append_turn(self, session_id: str, role: str, content: str) -> None:
        state = self.get(session_id)
        state.turns.append({"role": role, "content": content})
        if len(state.turns) > 40:
            state.turns = state.turns[-40:]


memory = SessionMemory()
