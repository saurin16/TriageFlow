from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
import uuid


class TriageRequest(BaseModel):
    symptoms: str
    age: int
    zip_code: str
    session_id: str = ""

    def model_post_init(self, __context: object) -> None:
        if not self.session_id:
            self.session_id = str(uuid.uuid4())


class SymptomEntities(BaseModel):
    body_systems: list[str]
    duration_hours: Optional[float] = None
    severity_keywords: list[str]
    red_flag_keywords: list[str]
    age_risk_factors: list[str]
    raw_summary: str


class TriageScore(BaseModel):
    urgency_score: int
    confidence: float
    clinical_reasoning: str
    requires_human_review: bool


class CareRoute(BaseModel):
    recommended_channel: Literal[
        "home_care", "telehealth", "urgent_care", "er", "call_911"
    ]
    reasoning: str
    estimated_wait_minutes: Optional[int] = None
    telehealth_available: bool
    human_review_triggered: bool


class FollowUpPlan(BaseModel):
    care_steps: list[str]
    warning_signs: list[str]
    follow_up_hours: int
    appointment_link: Optional[str] = None


class TriageResult(BaseModel):
    session_id: str
    timestamp: datetime
    input: TriageRequest
    symptom_entities: SymptomEntities
    triage_score: TriageScore
    care_route: CareRoute
    follow_up_plan: FollowUpPlan
    processing_time_ms: int


class AgentUpdate(BaseModel):
    agent_name: str
    status: Literal["running", "complete", "error"]
    output_preview: Optional[str] = None
    timestamp: datetime
