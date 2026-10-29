from typing import Optional, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langgraph.graph import END, START, StateGraph

from app.core.llm import get_llm
from app.core.prompts import PLANNER_SYSTEM_PROMPT
from app.schemas.models import ProjectPlan


class AgentState(TypedDict):
    requirements: str
    project_plan: Optional[ProjectPlan]


def generate_project_plan(state: AgentState) -> dict:
    planner = get_llm().with_structured_output(ProjectPlan)
    plan = planner.invoke(
        [
            SystemMessage(content=PLANNER_SYSTEM_PROMPT),
            HumanMessage(content=state["requirements"]),
        ]
    )
    return {"project_plan": plan}


workflow = StateGraph(AgentState)
workflow.add_node("planner", generate_project_plan)
workflow.add_edge(START, "planner")
workflow.add_edge("planner", END)
agent_app = workflow.compile()
