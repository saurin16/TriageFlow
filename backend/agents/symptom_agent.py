from langchain_core.prompts import ChatPromptTemplate
from agents.base_llm import get_llm
from models.schemas import SymptomEntities
from datetime import datetime, timezone
import json

llm = get_llm(temperature=0)

SYMPTOM_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a medical symptom extraction specialist. 
Extract structured clinical information from patient symptom descriptions.
You must respond with ONLY valid JSON matching this exact schema — no markdown, no explanation:
{{
  "body_systems": ["list of affected body systems, use standard medical terms"],
  "duration_hours": null or number,
  "severity_keywords": ["list of symptom descriptors present"],
  "red_flag_keywords": ["ONLY include: chest pain, difficulty breathing, stroke symptoms, severe bleeding, loss of consciousness, suicidal ideation, anaphylaxis signs"],
  "age_risk_factors": ["list any age-related risk factors given the patient age"],
  "raw_summary": "one sentence clinical summary"
}}"""),
    ("human", "Patient age: {age}\nSymptom description: {symptoms}")
])


async def run_symptom_agent(state: dict) -> dict:
    req = state["request"]
    updates = list(state.get("agent_updates", []))

    updates.append({
        "agent_name": "Symptom Agent",
        "status": "running",
        "output_preview": "Extracting symptom entities...",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    try:
        chain = SYMPTOM_PROMPT | llm
        response = await chain.ainvoke({"age": req.age, "symptoms": req.symptoms})
        content = response.content
        if isinstance(content, list):
            content = content[0]["text"] if content else ""
        data = json.loads(content)
        entities = SymptomEntities(**data)

        updates.append({
            "agent_name": "Symptom Agent",
            "status": "complete",
            "output_preview": f"Identified: {', '.join(entities.body_systems[:3])}",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

        return {"symptom_entities": entities, "agent_updates": updates}
    except Exception as e:
        updates.append({
            "agent_name": "Symptom Agent",
            "status": "error",
            "output_preview": str(e)[:200],
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        return {"error": str(e), "agent_updates": updates}
