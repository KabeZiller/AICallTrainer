from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class DifficultyLevel(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Persona(Base):
    __tablename__ = "personas"

    id = Column(Integer, primary_key=True, index=True)
    script_id = Column(Integer, ForeignKey("scripts.id"), nullable=False)
    difficulty = Column(Enum(DifficultyLevel), nullable=False)
    name = Column(String, nullable=False)
    personality = Column(Text, nullable=False)  # JSON string with personality traits
    objections = Column(Text, nullable=False)  # JSON string with common objections

    # Relationships
    script = relationship("Script", back_populates="personas")
    calls = relationship("Call", back_populates="persona")

