from langchain_core.prompts import ChatPromptTemplate
from agents.base_llm import get_llm
from models.schemas import CareRoute
from datetime import datetime, timezone
import json

llm = get_llm(temperature=0)

ROUTER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a healthcare care navigation specialist.
Based on urgency score and patient context, select the most appropriate care channel.

Care channels:
- home_care: Score 1, manageable at home with OTC treatment
- telehealth: Score 2, can be safely handled via video consultation
- urgent_care: Score 3, needs in-person evaluation today but not emergency
- er: Score 4, needs emergency evaluation within 2-4 hours
- call_911: Score 5, life-threatening, immediate emergency services

Respond with ONLY valid JSON — no markdown, no explanation:
{{
  "recommended_channel": one of the exact strings above,
  "reasoning": "patient-friendly explanation of why this channel (2 sentences, plain English)",
  "estimated_wait_minutes": integer or null,
  "telehealth_available": boolean,
  "human_review_triggered": boolean
}}"""),
    ("human", """Urgency score: {urgency_score}/5
Clinical reasoning: {clinical_reasoning}
Patient zip: {zip_code}
Requires human review: {requires_human_review}""")
])


async def run_care_router_agent(state: dict) -> dict:
    req = state["request"]
    score = state["triage_score"]
    updates = list(state.get("agent_updates", []))

    updates.append({
        "agent_name": "Care Router Agent",
        "status": "running",
        "output_preview": "Checking care options in your area...",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    try:
        chain = ROUTER_PROMPT | llm
        response = await chain.ainvoke({
            "urgency_score": score.urgency_score,
            "clinical_reasoning": score.clinical_reasoning,
            "zip_code": req.zip_code,
            "requires_human_review": score.requires_human_review
        })
        content = response.content
        if isinstance(content, list):
            content = content[0]["text"] if content else ""
        data = json.loads(content)
        route = CareRoute(**data)

        updates.append({
            "agent_name": "Care Router Agent",
            "status": "complete",
            "output_preview": f"Route: {route.recommended_channel.replace('_', ' ').title()}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"care_route": route, "agent_updates": updates}
    except Exception as e:
        updates.append({
            "agent_name": "Care Router Agent",
            "status": "error",
            "output_preview": str(e)[:200],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        return {"error": str(e), "agent_updates": updates}
