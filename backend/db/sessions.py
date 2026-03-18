import asyncpg
from models.schemas import TriageResult
from config import settings


async def save_session(result: TriageResult):
    """Save triage session to PostgreSQL for analytics."""
    try:
        conn = await asyncpg.connect(settings.database_url)
        await conn.execute(
            """
            INSERT INTO triage_sessions 
            (session_id, timestamp, urgency_score, recommended_channel, 
             processing_time_ms, zip_code, age, symptoms_summary)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (session_id) DO NOTHING
            """,
            result.session_id,
            result.timestamp,
            result.triage_score.urgency_score,
            result.care_route.recommended_channel,
            result.processing_time_ms,
            result.input.zip_code,
            result.input.age,
            result.symptom_entities.raw_summary,
        )
        await conn.close()
    except Exception as e:
        print(f"DB save failed (non-critical): {e}")
