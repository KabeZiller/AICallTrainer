from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class ScriptCreate(BaseModel):
    title: str
    content: str

class PersonaBase(BaseModel):
    id: int
    difficulty: str
    name: str
    personality: str
    objections: str

    class Config:
        from_attributes = True

class ScriptResponse(BaseModel):
    id: int
    title: str
    content: str
    created_by: int
    created_at: datetime
    personas: Optional[List[PersonaBase]] = []

    class Config:
        from_attributes = True

