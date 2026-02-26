from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Role = Literal["TEACHER", "STUDENT", "UNKNOWN"]
Intent = Literal["ANALYSIS", "QUESTION_GENERATION", "CONVERSATIONAL"]


class UploadArtifact(BaseModel):
    fileName: str
    mimeType: str
    base64Data: str = Field(min_length=1)


class ConversationTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: str


class AIEngineRequest(BaseModel):
    userId: str
    role: Role
    sessionId: str
    message: str = ""
    uploads: List[UploadArtifact] = Field(default_factory=list)
    history: List[ConversationTurn] = Field(default_factory=list)


class HandwritingFeedback(BaseModel):
    legibility: str
    lineConsistency: str
    characterSpacing: str
    meaningImpact: str
    suggestions: List[str]


class AIEngineResponse(BaseModel):
    sessionId: str
    intent: Intent
    role: Role
    responseText: str
    followUpSuggestion: Optional[str] = None
    generatedQuestions: Optional[List[str]] = None
    handwritingFeedback: Optional[HandwritingFeedback] = None
