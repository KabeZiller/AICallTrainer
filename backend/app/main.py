from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import auth, scripts, calls, analytics

app = FastAPI(
    title="AI Call Trainer API",
    description="API for AI-powered cold call training platform",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(scripts.router, prefix="/scripts", tags=["Scripts"])
app.include_router(calls.router, prefix="/calls", tags=["Calls"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {"message": "AI Call Trainer API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

