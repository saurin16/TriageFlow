from langgraph.graph import StateGraph, END
from typing import Optional, Annotated
from typing_extensions import TypedDict
from operator import add

from models.schemas import (
    TriageRequest, SymptomEntities, TriageScore,
    CareRoute, FollowUpPlan
)
from agents.symptom_agent import run_symptom_agent
from agents.triage_agent import run_triage_agent
from agents.care_router_agent import run_care_router_agent
from agents.followup_agent import run_followup_agent


class TriageState(TypedDict):
    request: TriageRequest
    symptom_entities: Optional[SymptomEntities]
    triage_score: Optional[TriageScore]
    care_route: Optional[CareRoute]
    follow_up_plan: Optional[FollowUpPlan]
    agent_updates: Annotated[list[dict], add]
    error: Optional[str]


def route_after_triage(state: TriageState) -> str:
    """If urgency >= 4, still proceed to care_router but it will flag human_review_triggered=True."""
    if state.get("error"):
        return END
    return "care_router_agent"


def check_error(state: TriageState) -> str:
    if state.get("error"):
        return END
    return "triage_agent"


def check_error_after_router(state: TriageState) -> str:
    if state.get("error"):
        return END
    return "followup_agent"


def build_triage_graph():
    workflow = StateGraph(TriageState)

    workflow.add_node("symptom_agent", run_symptom_agent)
    workflow.add_node("triage_agent", run_triage_agent)
    workflow.add_node("care_router_agent", run_care_router_agent)
    workflow.add_node("followup_agent", run_followup_agent)

    workflow.set_entry_point("symptom_agent")
    workflow.add_conditional_edges("symptom_agent", check_error, {
        "triage_agent": "triage_agent",
        END: END,
    })
    workflow.add_conditional_edges("triage_agent", route_after_triage, {
        "care_router_agent": "care_router_agent",
        END: END,
    })
    workflow.add_conditional_edges("care_router_agent", check_error_after_router, {
        "followup_agent": "followup_agent",
        END: END,
    })
    workflow.add_edge("followup_agent", END)

    return workflow.compile()


triage_graph = build_triage_graph()
