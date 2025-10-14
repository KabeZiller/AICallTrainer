from pydantic import BaseModel
from typing import List

class UserStatsResponse(BaseModel):
    total_calls: int
    avg_score: float
    achievements: List[str]
    recent_improvement: float

class LeaderboardEntry(BaseModel):
    user_id: int
    email: str
    total_calls: int
    avg_score: float
    rank: int

    class Config:
        from_attributes = True

