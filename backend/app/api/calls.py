from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
import json
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.models.call import Call
from app.models.persona import Persona
from app.models.user_stats import UserStats
from app.models.achievement import Achievement
from app.schemas.call import CallStart, CallResponse
from app.utils.auth import get_current_user
from app.services.openai_service import analyze_call, create_persona_system_prompt
from app.services.realtime_service import RealtimeCallHandler

router = APIRouter()

@router.post("/start", response_model=CallResponse, status_code=status.HTTP_201_CREATED)
async def start_call(
    call_data: CallStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initialize a new call session with a persona."""
    
    # Verify persona exists
    persona = db.query(Persona).filter(Persona.id == call_data.persona_id).first()
    if not persona:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Persona not found"
        )
    
    # Create call record
    new_call = Call(
        user_id=current_user.id,
        persona_id=call_data.persona_id
    )
    db.add(new_call)
    db.commit()
    db.refresh(new_call)
    
    return new_call

@router.websocket("/realtime/{call_id}")
async def realtime_call(websocket: WebSocket, call_id: int, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time voice calls using OpenAI Realtime API."""
    await websocket.accept()
    
    try:
        # Get call and persona
        call = db.query(Call).filter(Call.id == call_id).first()
        if not call:
            await websocket.close(code=1008, reason="Call not found")
            return
        
        persona = db.query(Persona).filter(Persona.id == call.persona_id).first()
        script = persona.script
        
        # Create system prompt for the persona
        system_prompt = create_persona_system_prompt({
            "name": persona.name,
            "difficulty": persona.difficulty,
            "personality": persona.personality,
            "objections": persona.objections
        })
        
        # Initialize Realtime API handler
        handler = RealtimeCallHandler(websocket, system_prompt)
        
        # Handle the call
        transcript = await handler.handle_call()
        
        # Update call with transcript and duration
        call.transcript = transcript
        call.duration = handler.duration
        db.commit()
        
        # Analyze the call
        analysis = await analyze_call(transcript, script.content, persona.name)
        
        # Update call with analysis
        call.score = analysis.get("overall_score", 0)
        call.feedback = json.dumps(analysis)
        db.commit()
        
        # Update user stats
        stats = db.query(UserStats).filter(UserStats.user_id == call.user_id).first()
        if stats:
            stats.total_calls += 1
            # Calculate new average score
            total_score = stats.avg_score * (stats.total_calls - 1) + call.score
            stats.avg_score = total_score / stats.total_calls
            db.commit()
        
        # Check for achievements
        await check_and_award_achievements(db, call.user_id, call, stats)
        
        # Send final analysis to client
        await websocket.send_json({
            "type": "call_complete",
            "analysis": analysis
        })
        
    except WebSocketDisconnect:
        print(f"WebSocket disconnected for call {call_id}")
    except Exception as e:
        print(f"Error in realtime call: {e}")
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })
    finally:
        await websocket.close()

@router.post("/{call_id}/end")
async def end_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manually end a call and trigger analysis."""
    call = db.query(Call).filter(Call.id == call_id, Call.user_id == current_user.id).first()
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    
    # If transcript exists but no analysis, analyze it
    if call.transcript and not call.feedback:
        persona = db.query(Persona).filter(Persona.id == call.persona_id).first()
        script = persona.script
        
        analysis = await analyze_call(call.transcript, script.content, persona.name)
        call.score = analysis.get("overall_score", 0)
        call.feedback = json.dumps(analysis)
        db.commit()
    
    return {"message": "Call ended", "call_id": call_id}

@router.get("/{call_id}", response_model=CallResponse)
async def get_call(
    call_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details of a specific call."""
    call = db.query(Call).filter(Call.id == call_id, Call.user_id == current_user.id).first()
    if not call:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Call not found"
        )
    return call

@router.get("/history", response_model=List[CallResponse])
async def get_call_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's call history."""
    calls = db.query(Call).filter(Call.user_id == current_user.id).order_by(Call.created_at.desc()).all()
    return calls

async def check_and_award_achievements(db: Session, user_id: int, call: Call, stats: UserStats):
    """Check and award achievements based on call performance."""
    achievements_to_award = []
    
    # First Call achievement
    if stats.total_calls == 1:
        achievements_to_award.append("first_call")
    
    # Perfect Pitch (score >= 90)
    if call.score >= 90:
        # Check if not already awarded
        existing = db.query(Achievement).filter(
            Achievement.user_id == user_id,
            Achievement.achievement_type == "perfect_pitch"
        ).first()
        if not existing:
            achievements_to_award.append("perfect_pitch")
    
    # 10 Calls Milestone
    if stats.total_calls == 10:
        achievements_to_award.append("10_calls")
    
    # 50 Calls Milestone
    if stats.total_calls == 50:
        achievements_to_award.append("50_calls")
    
    # Objection Master (score >= 85 on hard persona)
    persona = db.query(Persona).filter(Persona.id == call.persona_id).first()
    if persona.difficulty == "hard" and call.score >= 85:
        existing = db.query(Achievement).filter(
            Achievement.user_id == user_id,
            Achievement.achievement_type == "objection_master"
        ).first()
        if not existing:
            achievements_to_award.append("objection_master")
    
    # Award achievements
    for achievement_type in achievements_to_award:
        achievement = Achievement(
            user_id=user_id,
            achievement_type=achievement_type
        )
        db.add(achievement)
    
    if achievements_to_award:
        db.commit()

