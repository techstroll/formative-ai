"""
Formative.AI - FastAPI AI Pipeline
AI-powered agents for product lifecycle generation
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
from datetime import datetime
import logging
import asyncio
from uuid import uuid4
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from src.agents.research_agent import get_research_agent
from src.mock_research import generate_mock_research

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory store for research requests (temporary - will use database)
_research_store = {}

# Initialize FastAPI app
app = FastAPI(
    title="Formative.AI - AI Pipeline",
    description="FastAPI backend for AI-powered product lifecycle generation",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# MODELS
# ============================================================================

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    environment: str


class ResearchRequest(BaseModel):
    project_id: str
    topic: str
    target_audience: Optional[str] = None
    geographic_focus: Optional[str] = None
    competitors: List[str] = []


class ResearchResponse(BaseModel):
    id: str
    project_id: str
    topic: str
    status: str
    created_at: str


class ResearchResultResponse(BaseModel):
    id: str
    project_id: str
    status: str
    content: dict
    generated_at: str


# ============================================================================
# ROUTES
# ============================================================================

@app.get("/health")
async def health_check() -> HealthResponse:
    """
    Health check endpoint for the AI pipeline
    """
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow().isoformat(),
        environment=os.getenv("ENV", "development"),
    )


@app.get("/ready")
async def readiness_check():
    """
    Readiness check - indicates if service is ready for requests
    """
    # TODO: Check database connection, LLM availability, etc.
    return {"ready": True, "timestamp": datetime.utcnow().isoformat()}


@app.get("/")
async def root():
    """
    API root endpoint
    """
    return {
        "name": "Formative.AI - AI Pipeline",
        "version": "1.0.0",
        "status": "running",
    }


# ============================================================================
# RESEARCH AGENT ROUTES
# ============================================================================

@app.post("/api/v1/research")
async def create_research(request: ResearchRequest, background_tasks: BackgroundTasks) -> ResearchResponse:
    """
    Trigger research agent to analyze market/topic
    """
    research_id = str(uuid4())
    logger.info(f"Research request received for project: {request.project_id}")

    # Store request
    _research_store[research_id] = {
        "id": research_id,
        "project_id": request.project_id,
        "topic": request.topic,
        "status": "generating",
        "created_at": datetime.utcnow().isoformat(),
        "content": None,
    }

    # Run research generation in background
    background_tasks.add_task(
        _run_research_generation,
        research_id=research_id,
        request_data=request.dict(),
    )

    return ResearchResponse(
        id=research_id,
        project_id=request.project_id,
        topic=request.topic,
        status="generating",
        created_at=_research_store[research_id]["created_at"],
    )


async def _run_research_generation(research_id: str, request_data: dict):
    """Background task: Generate research report with 3-minute timeout"""
    try:
        # Check if API keys are available
        has_api_keys = bool(os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY"))

        logger.info(f"Starting research generation for {research_id}")
        logger.info(f"Request data: {request_data}")

        # Set 3-minute (180 seconds) timeout for research generation
        RESEARCH_TIMEOUT = 180  # 3 minutes

        try:
            if has_api_keys:
                logger.info(f"Using real research agent for {research_id}")
                agent = get_research_agent()
                result = await asyncio.wait_for(
                    agent.generate_research(request_data),
                    timeout=RESEARCH_TIMEOUT
                )
            else:
                logger.info(f"Using mock research data for {research_id} (no API keys configured)")
                result = await asyncio.wait_for(
                    generate_mock_research(request_data),
                    timeout=RESEARCH_TIMEOUT
                )

            _research_store[research_id]["status"] = "completed"
            _research_store[research_id]["content"] = result
            logger.info(f"Research {research_id} completed successfully")

        except asyncio.TimeoutError:
            logger.warning(f"Research {research_id} timed out after {RESEARCH_TIMEOUT} seconds")
            # Return partial results if available, or a timeout message
            partial_result = _research_store[research_id].get("content", {})
            if partial_result:
                logger.info(f"Returning partial results for {research_id}")
                _research_store[research_id]["status"] = "completed"
                _research_store[research_id]["timeout_warning"] = f"Research generation timed out after {RESEARCH_TIMEOUT} seconds. Partial results may be incomplete."
            else:
                logger.error(f"Research {research_id} timed out with no partial results")
                _research_store[research_id]["status"] = "timeout"
                _research_store[research_id]["error"] = f"Research generation timed out after {RESEARCH_TIMEOUT} seconds"

    except Exception as e:
        import traceback
        logger.error(f"Research {research_id} failed: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        _research_store[research_id]["status"] = "failed"
        _research_store[research_id]["error"] = str(e)


@app.get("/api/v1/research/{research_id}")
async def get_research(research_id: str):
    """
    Retrieve research artifact by ID
    """
    if research_id not in _research_store:
        raise HTTPException(status_code=404, detail="Research not found")

    research = _research_store[research_id]
    return ResearchResultResponse(
        id=research["id"],
        project_id=research["project_id"],
        status=research["status"],
        content=research["content"] or {},
        generated_at=research.get("created_at", ""),
    )


# ============================================================================
# WIREFRAME AGENT ROUTES
# ============================================================================

@app.post("/api/v1/wireframes")
async def create_wireframes(project_id: str, research_id: Optional[str] = None):
    """
    Trigger wireframe generation agent
    """
    # TODO: Implement wireframe generation logic
    return {"id": "wireframe-id", "project_id": project_id, "status": "pending"}


@app.get("/api/v1/wireframes/{wireframe_id}")
async def get_wireframes(wireframe_id: str):
    """
    Retrieve wireframe artifact by ID
    """
    # TODO: Implement
    return {"id": wireframe_id, "status": "pending"}


# ============================================================================
# PROTOTYPE AGENT ROUTES
# ============================================================================

@app.post("/api/v1/prototypes")
async def create_prototype(project_id: str, wireframe_id: Optional[str] = None):
    """
    Trigger prototype generation agent
    """
    # TODO: Implement prototype generation logic
    return {"id": "prototype-id", "project_id": project_id, "status": "pending"}


@app.get("/api/v1/prototypes/{prototype_id}")
async def get_prototype(prototype_id: str):
    """
    Retrieve prototype artifact by ID
    """
    # TODO: Implement
    return {"id": prototype_id, "status": "pending"}


# ============================================================================
# PRD AGENT ROUTES
# ============================================================================

@app.post("/api/v1/prds")
async def create_prd(project_id: str):
    """
    Trigger PRD generation agent
    Assembles research, wireframes, and prototype into complete PRD
    """
    # TODO: Implement PRD generation logic
    return {"id": "prd-id", "project_id": project_id, "status": "pending"}


@app.get("/api/v1/prds/{prd_id}")
async def get_prd(prd_id: str):
    """
    Retrieve PRD artifact by ID
    """
    # TODO: Implement
    return {"id": prd_id, "status": "pending"}


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(HTTPException)
async def http_exception_handler(exc: HTTPException):
    """
    Custom HTTP exception handler
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "status": exc.status_code,
            "message": exc.detail,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(exc: Exception):
    """
    Global exception handler for unhandled errors
    """
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "status": 500,
            "message": "Internal server error",
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


# ============================================================================
# STARTUP AND SHUTDOWN EVENTS
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """
    Initialize application on startup
    """
    logger.info("""
╔════════════════════════════════════════════════════════════════╗
║         Formative.AI AI Pipeline - Server Started              ║
║                                                                ║
║  Environment: development                                      ║
║  FastAPI Version: 0.104.1                                      ║
╚════════════════════════════════════════════════════════════════╝
    """)

    # Check API keys
    has_claude = bool(os.getenv("ANTHROPIC_API_KEY"))
    has_openai = bool(os.getenv("OPENAI_API_KEY"))

    if has_claude:
        logger.info("✓ Claude API Key configured - Will use Claude for research")
    if has_openai:
        logger.info("✓ OpenAI API Key configured - Available as fallback")
    if not has_claude and not has_openai:
        logger.warning("⚠ No API keys configured - Will use mock research data")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Clean up on shutdown
    """
    logger.info("AI Pipeline shutting down...")
    # TODO: Clean up connections


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("ENV") == "development",
    )
