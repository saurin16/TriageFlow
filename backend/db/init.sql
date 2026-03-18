CREATE TABLE IF NOT EXISTS triage_sessions (
    session_id UUID PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    urgency_score INTEGER NOT NULL CHECK (urgency_score BETWEEN 1 AND 5),
    recommended_channel VARCHAR(20) NOT NULL,
    processing_time_ms INTEGER,
    zip_code VARCHAR(10),
    age INTEGER,
    symptoms_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_triage_timestamp ON triage_sessions(timestamp);
CREATE INDEX IF NOT EXISTS idx_triage_channel ON triage_sessions(recommended_channel);
