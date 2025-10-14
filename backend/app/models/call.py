from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Call(Base):
    __tablename__ = "calls"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    persona_id = Column(Integer, ForeignKey("personas.id"), nullable=False)
    transcript = Column(Text)
    audio_url = Column(String)
    duration = Column(Integer)  # Duration in seconds
    score = Column(Float)  # Score out of 100
    feedback = Column(Text)  # JSON string with detailed feedback
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="calls")
    persona = relationship("Persona", back_populates="calls")

