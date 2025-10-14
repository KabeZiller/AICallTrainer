from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.user_stats import UserStats
from app.models.achievement import Achievement
from app.models.call import Call
from app.schemas.analytics import UserStatsResponse, LeaderboardEntry
from app.utils.auth import get_current_user

router = APIRouter()

@router.get("/user-stats", response_model=UserStatsResponse)
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's statistics."""
    stats = db.query(UserStats).filter(UserStats.user_id == current_user.id).first()
    achievements = db.query(Achievement).filter(Achievement.user_id == current_user.id).all()
    
    # Calculate recent improvement (last 5 calls vs previous 5 calls)
    recent_calls = db.query(Call).filter(
        Call.user_id == current_user.id,
        Call.score.isnot(None)
    ).order_by(Call.created_at.desc()).limit(10).all()
    
    recent_improvement = 0.0
    if len(recent_calls) >= 10:
        recent_avg = sum(c.score for c in recent_calls[:5]) / 5
        previous_avg = sum(c.score for c in recent_calls[5:10]) / 5
        recent_improvement = recent_avg - previous_avg
    
    return UserStatsResponse(
        total_calls=stats.total_calls if stats else 0,
        avg_score=stats.avg_score if stats else 0.0,
        achievements=[a.achievement_type for a in achievements],
        recent_improvement=recent_improvement
    )

@router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leaderboard of all users."""
    # Query user stats with user info, ordered by avg_score
    results = db.query(
        UserStats.user_id,
        User.email,
        UserStats.total_calls,
        UserStats.avg_score
    ).join(User, User.id == UserStats.user_id)\
    .filter(UserStats.total_calls > 0)\
    .order_by(UserStats.avg_score.desc())\
    .all()
    
    # Add rankings
    leaderboard = []
    for rank, (user_id, email, total_calls, avg_score) in enumerate(results, start=1):
        leaderboard.append(LeaderboardEntry(
            user_id=user_id,
            email=email,
            total_calls=total_calls,
            avg_score=avg_score,
            rank=rank
        ))
    
    return leaderboard

