from fastapi import APIRouter, HTTPException
from app.schemas.models import ProjectRequest, ProjectPlan
from app.core.agents import agent_app

# Create a FastAPI router
router = APIRouter()


def _model_error_response(error: str) -> tuple[int, str]:
    """Translate provider failures into useful messages without exposing secrets."""
    normalized_error = error.lower()

    if "groq_api_key is not configured" in normalized_error:
        return 503, "GROQ_API_KEY is not configured. Add it to backend/.env and restart the API."
    if any(marker in normalized_error for marker in ("apiconnectionerror", "connecterror", "connection error", "winerror 10013")):
        return 503, "The backend cannot connect to Groq. Check its internet, VPN, proxy, or firewall access, then restart the API."
    if any(marker in normalized_error for marker in ("invalid_api_key", "invalid api key", "authentication", "error code: 401")):
        return 502, "Groq rejected the API key. Check GROQ_API_KEY in backend/.env and restart the API."
    if "model_not_found" in normalized_error or "does not exist or you do not have access" in normalized_error:
        return 502, "Groq could not find or access the configured model. Check GROQ_MODEL in backend/.env."

    return 502, "The planning model could not generate a valid plan. Check backend/server.err.log for details and try again."


@router.post("/generate-plan", response_model=ProjectPlan)
def generate_plan(request: ProjectRequest):
    """
    Receives project requirements and returns a structured project plan.
    """
    # 1. Prepare the initial state for LangGraph
    if not request.requirements.strip():
        raise HTTPException(status_code=422, detail="Please provide project requirements.")

    initial_state = {"requirements": request.requirements.strip()}
    
    # Run the LangGraph workflow and translate provider errors for the API client.
    try:
        result = agent_app.invoke(initial_state)
    except Exception as e:
        status_code, detail = _model_error_response(str(e))
        raise HTTPException(status_code=status_code, detail=detail) from e

    plan = result.get("project_plan")
    if not plan:
        raise HTTPException(status_code=502, detail="Agent failed to generate a plan.")

    return plan
