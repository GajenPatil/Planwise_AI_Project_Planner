from pydantic import BaseModel, Field
from typing import List

class ProjectRequest(BaseModel):
    requirements: str = Field(..., min_length=1, max_length=20000, description="Raw project requirements.")

class Task(BaseModel):
    task_name: str = Field(..., description="Actionable task name.")
    description: str = Field(..., description="Brief explanation.")
    effort_hours: int = Field(..., ge=1, description="Estimated hours.")
    dependencies: List[str] = Field(default_factory=list, description="Tasks to complete first.")

class Milestone(BaseModel):
    milestone_name: str = Field(..., description="Phase name.")
    tasks: List[Task] = Field(..., min_length=1, description="Tasks in this milestone.")

class ProjectPlan(BaseModel):
    project_title: str = Field(..., description="Project title.")
    milestones: List[Milestone] = Field(..., description="Chronological milestones.")
    total_estimated_hours: int = Field(..., description="Total hours.")
