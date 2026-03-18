from langchain_core.prompts import ChatPromptTemplate
from agents.base_llm import get_llm
from models.schemas import TriageScore, SymptomEntities
from config import settings
from datetime import datetime, timezone
import json

llm = get_llm(temperature=0)

TRIAGE_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a clinical triage specialist trained on START and SALT triage protocols.
Score the urgency of this case on a 1-5 scale:
1 = Home care appropriate (rest, fluids, OTC meds)
2 = Telehealth within 24 hours
3 = Urgent care today
4 = ER within 2-4 hours (human review required)
5 = Call 911 immediately (human review required)

Respond with ONLY valid JSON — no markdown, no explanation:
{{
  "urgency_score": integer 1-5,
  "confidence": float 0.0-1.0,
  "clinical_reasoning": "2-3 sentence clinical rationale",
  "requires_human_review": boolean (true if score >= 4)
}}"""),
    ("human", """Patient age: {age}
Symptoms: {symptoms}
Extracted entities: {entities}
Red flags present: {red_flags}
Clinical protocol context: {clinical_context}""")
])


async def get_clinical_context(entities: SymptomEntities) -> str:
    """Retrieve triage guidelines from DO Gradient Knowledge Base if configured."""
    if not settings.do_knowledge_base_id:
        return ""
    try:
        import httpx
        query = f"{' '.join(entities.body_systems)} {' '.join(entities.severity_keywords)}"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.do_inference_base_url}/knowledge-bases/{settings.do_knowledge_base_id}/retrieve",
                headers={"Authorization": f"Bearer {settings.do_inference_key}"},
                json={"query": query, "top_k": 3},
                timeout=5.0,
            )
            if response.status_code == 200:
                results = response.json().get("results", [])
                return "\n".join([r.get("text", "") for r in results[:3]])
    except Exception:
        pass
    return ""


async def run_triage_agent(state: dict) -> dict:
    req = state["request"]
    entities = state["symptom_entities"]
    updates = list(state.get("agent_updates", []))

    updates.append({
        "agent_name": "Triage Agent",
        "status": "running",
        "output_preview": "Scoring urgency via clinical protocol...",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    try:
        clinical_context = await get_clinical_context(entities)

        chain = TRIAGE_PROMPT | llm
        response = await chain.ainvoke({
            "age": req.age,
            "symptoms": req.symptoms,
            "entities": entities.model_dump_json(),
            "red_flags": entities.red_flag_keywords,
            "clinical_context": clinical_context or "No additional protocol context available.",
        })
        content = response.content
        if isinstance(content, list):
            content = content[0]["text"] if content else ""
        data = json.loads(content)
        score = TriageScore(**data)

        review_note = " — HUMAN REVIEW TRIGGERED" if score.requires_human_review else ""
        updates.append({
            "agent_name": "Triage Agent",
            "status": "complete",
            "output_preview": f"Urgency: {score.urgency_score}/5 ({score.confidence:.0%} confidence){review_note}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"triage_score": score, "agent_updates": updates}
    except Exception as e:
        updates.append({
            "agent_name": "Triage Agent",
            "status": "error",
            "output_preview": str(e)[:200],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        return {"error": str(e), "agent_updates": updates}
