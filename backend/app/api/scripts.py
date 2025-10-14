from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.models.script import Script
from app.models.persona import Persona
from app.schemas.script import ScriptCreate, ScriptResponse
from app.utils.auth import get_current_user, get_current_admin_user
from app.services.openai_service import generate_personas
import json

router = APIRouter()

@router.post("", response_model=ScriptResponse, status_code=status.HTTP_201_CREATED)
async def create_script(
    script_data: ScriptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new script and automatically generate personas (Admin only)."""
    
    # Create the script
    new_script = Script(
        title=script_data.title,
        content=script_data.content,
        created_by=current_user.id
    )
    db.add(new_script)
    db.commit()
    db.refresh(new_script)
    
    # Generate personas using GPT-5 Thinking
    try:
        personas_data = await generate_personas(script_data.content)
        
        # Create persona records
        for persona_data in personas_data:
            persona = Persona(
                script_id=new_script.id,
                difficulty=persona_data["difficulty"],
                name=persona_data["name"],
                personality=persona_data["personality"] if isinstance(persona_data["personality"], str) else json.dumps(persona_data["personality"]),
                objections=persona_data["objections"] if isinstance(persona_data["objections"], str) else json.dumps(persona_data["objections"])
            )
            db.add(persona)
        
        db.commit()
        db.refresh(new_script)
        
    except Exception as e:
        # If persona generation fails, still return the script
        print(f"Error generating personas: {e}")
    
    return new_script

@router.get("", response_model=List[ScriptResponse])
async def get_scripts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all scripts with their personas."""
    scripts = db.query(Script).all()
    return scripts

@router.get("/{script_id}", response_model=ScriptResponse)
async def get_script(
    script_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific script with its personas."""
    script = db.query(Script).filter(Script.id == script_id).first()
    if not script:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Script not found"
        )
    return script

