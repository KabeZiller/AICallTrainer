from pydantic import BaseModel

class PersonaResponse(BaseModel):
    id: int
    script_id: int
    difficulty: str
    name: str
    personality: str
    objections: str

    class Config:
        from_attributes = True

