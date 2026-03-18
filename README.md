# TriageFlow

> AI-powered care routing that tells you where to go before you go there.

## The Problem

27% of US ER visits are unnecessary — costing $38B/year and crowding out patients who need emergency care.

## The Solution

TriageFlow is a 4-agent AI system that takes a patient's symptom description and routes them to the right care channel (home care -> telehealth -> urgent care -> ER -> 911) in under 60 seconds.

## Architecture

**Agent Pipeline:**

1. **Symptom Agent** — extracts structured clinical entities from free-text
2. **Triage Agent** — scores urgency 1-5 using clinical triage protocols (with DO Knowledge Base retrieval)
3. **Care Router Agent** — maps score + location to care channel; triggers human review for score >= 4
4. **Follow-up Agent** — generates personalized care steps and warning signs

## Tech Stack

| Layer | Technology |
|---|---|
| AI Inference | **DigitalOcean Gradient Serverless Inference** (Claude Sonnet 4.6) |
| Agent Framework | LangGraph multi-agent pipeline |
| Knowledge Base | **DigitalOcean Gradient Knowledge Base** (clinical triage protocols) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Database | **DigitalOcean Managed PostgreSQL** |
| Deployment | **DigitalOcean App Platform** |
| Observability | LangSmith agent traces |

> Every component runs on DigitalOcean. No external cloud dependencies.

## Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/triageflow
cd triageflow
cp .env.example .env  # Add your API keys
docker-compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:8000/docs

### Running without Docker

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows (use source venv/bin/activate on Mac/Linux)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
pnpm install
pnpm dev
```

## Deploy to DigitalOcean

```bash
# Push to GitHub
git add . && git commit -m "deploy" && git push

# Deploy via DO App Platform
doctl apps create --spec .do/app.yaml
```

Or use the DigitalOcean dashboard: Apps > Create App > GitHub > select this repo.

## Hackathon

Built for the [DigitalOcean Gradient AI Hackathon](https://digitalocean.devpost.com) — March 2026.

## Disclaimer

TriageFlow is not a medical diagnosis tool. Always call 911 for life-threatening emergencies.

## License

MIT
