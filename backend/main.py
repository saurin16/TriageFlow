from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from models.schemas import TriageRequest, TriageResult
from agents.graph import triage_graph
from db.sessions import save_session
from datetime import datetime, timezone
import asyncio
import json
import time
import uuid
import os

app = FastAPI(title="TriageFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Validate critical env vars on startup so health check fails fast with a clear error."""
    missing = []
    if not os.getenv("DO_INFERENCE_KEY") and not os.getenv("ANTHROPIC_API_KEY"):
        missing.append("DO_INFERENCE_KEY or ANTHROPIC_API_KEY")
    if missing:
        print(f"WARNING: Missing env vars: {', '.join(missing)}")
    else:
        print("Startup OK — inference key present")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"Model: {os.getenv('DO_MODEL', 'claude-sonnet-4-6')}")


@app.get("/")
async def root():
    return {"status": "ok", "service": "TriageFlow API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.post("/triage/stream")
async def triage_stream(request: TriageRequest):
    """SSE endpoint — streams agent updates as they happen."""

    async def event_generator():
        start_time = time.time()
        session_id = str(uuid.uuid4())

        initial_state = {
            "request": request,
            "symptom_entities": None,
            "triage_score": None,
            "care_route": None,
            "follow_up_plan": None,
            "agent_updates": [],
            "error": None,
        }

        last_update_count = 0
        accumulated = dict(initial_state)

        try:
            async for state_chunk in triage_graph.astream(initial_state):
                for node_name, node_state in state_chunk.items():
                    if isinstance(node_state, dict):
                        for key, val in node_state.items():
                            if key == "agent_updates":
                                updates = val
                                while last_update_count < len(updates):
                                    update = updates[last_update_count]
                                    yield {
                                        "event": "agent_update",
                                        "data": json.dumps(update),
                                    }
                                    last_update_count += 1
                                    await asyncio.sleep(0.05)
                            if val is not None:
                                accumulated[key] = val

            if accumulated.get("error"):
                yield {
                    "event": "error",
                    "data": json.dumps({"message": accumulated["error"]}),
                }
            elif accumulated.get("follow_up_plan"):
                processing_time = int((time.time() - start_time) * 1000)
                result = TriageResult(
                    session_id=session_id,
                    timestamp=datetime.now(timezone.utc),
                    input=request,
                    symptom_entities=accumulated["symptom_entities"],
                    triage_score=accumulated["triage_score"],
                    care_route=accumulated["care_route"],
                    follow_up_plan=accumulated["follow_up_plan"],
                    processing_time_ms=processing_time,
                )
                asyncio.create_task(save_session(result))
                yield {
                    "event": "complete",
                    "data": result.model_dump_json(),
                }
            else:
                yield {
                    "event": "error",
                    "data": json.dumps({"message": "Pipeline did not complete"}),
                }

        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"message": str(e)}),
            }

    return EventSourceResponse(event_generator())


@app.post("/triage", response_model=TriageResult)
async def triage_sync(request: TriageRequest):
    """Synchronous fallback endpoint for testing."""
    start_time = time.time()

    initial_state = {
        "request": request,
        "symptom_entities": None,
        "triage_score": None,
        "care_route": None,
        "follow_up_plan": None,
        "agent_updates": [],
        "error": None,
    }

    final_state = await triage_graph.ainvoke(initial_state)

    if final_state.get("error"):
        raise HTTPException(status_code=500, detail=final_state["error"])

    return TriageResult(
        session_id=str(uuid.uuid4()),
        timestamp=datetime.now(timezone.utc),
        input=request,
        symptom_entities=final_state["symptom_entities"],
        triage_score=final_state["triage_score"],
        care_route=final_state["care_route"],
        follow_up_plan=final_state["follow_up_plan"],
        processing_time_ms=int((time.time() - start_time) * 1000),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080)