from langchain_core.prompts import ChatPromptTemplate
from agents.base_llm import get_llm
from models.schemas import FollowUpPlan
from datetime import datetime, timezone
import json

llm = get_llm(temperature=0.2)

FOLLOWUP_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a patient care coordinator. Create a clear, actionable follow-up plan.
Write for a non-medical audience. Be specific and reassuring, not alarming.

Respond with ONLY valid JSON — no markdown, no explanation:
{{
  "care_steps": ["list of 3-5 specific action steps the patient should take right now"],
  "warning_signs": ["list of 3-4 specific symptoms that mean they should escalate care immediately"],
  "follow_up_hours": integer (when to check back in or reassess),
  "appointment_link": null
}}"""),
    ("human", """Recommended care: {recommended_channel}
Original symptoms: {symptoms}
Clinical reasoning: {clinical_reasoning}
Patient age: {age}""")
])


async def run_followup_agent(state: dict) -> dict:
    req = state["request"]
    score = state["triage_score"]
    route = state["care_route"]
    updates = list(state.get("agent_updates", []))

    updates.append({
        "agent_name": "Follow-up Agent",
        "status": "running",
        "output_preview": "Generating your care plan...",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    try:
        chain = FOLLOWUP_PROMPT | llm
        response = await chain.ainvoke({
            "recommended_channel": route.recommended_channel,
            "symptoms": req.symptoms,
            "clinical_reasoning": score.clinical_reasoning,
            "age": req.age
        })
        content = response.content
        if isinstance(content, list):
            content = content[0]["text"] if content else ""
        data = json.loads(content)
        plan = FollowUpPlan(**data)

        updates.append({
            "agent_name": "Follow-up Agent",
            "status": "complete",
            "output_preview": f"{len(plan.care_steps)} care steps generated",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"follow_up_plan": plan, "agent_updates": updates}
    except Exception as e:
        updates.append({
            "agent_name": "Follow-up Agent",
            "status": "error",
            "output_preview": str(e)[:200],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        return {"error": str(e), "agent_updates": updates}
