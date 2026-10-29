from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

# 1. Initialize the FastAPI application
app = FastAPI(
    title="Project Planning Agent API",
    description="An AI agent that breaks down requirements into milestones and tasks.",
    version="1.0.0"
)

# 2. Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],                     
    allow_headers=["*"],                     
)

# 3. Attach our endpoints to the app
app.include_router(api_router, prefix="/api")

# 4. A simple health-check route
@app.get("/")
async def health_check():
    return {"status": "success", "message": "Project Planning Agent API is running!"}
