from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CallStart(BaseModel):
    persona_id: int

class CallResponse(BaseModel):
    id: int
    user_id: int
    persona_id: int
    transcript: Optional[str] = None
    audio_url: Optional[str] = None
    duration: Optional[int] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CallFeedback(BaseModel):
    score: float
    feedback: str
    script_adherence: float
    objection_handling: float
    tonality: float
    value_delivery: float
    outcome: str

