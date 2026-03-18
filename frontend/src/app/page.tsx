"use client";
import { useState } from "react";
import { useTriageStream } from "@/hooks/useTriageStream";
import { SymptomForm } from "@/components/SymptomForm";
import { AgentTracePanel } from "@/components/AgentTracePanel";
import { TriageResultCard } from "@/components/TriageResultCard";
import { HumanReviewAlert } from "@/components/HumanReviewAlert";

const DEMO_SCENARIOS = [
  {
    label: "Child ear infection (low urgency)",
    symptoms:
      "My 4-year-old has had a fever of 102\u00B0F for 6 hours and is pulling at her left ear and crying when she swallows.",
    age: 4,
    zip: "60540",
  },
  {
    label: "Chest pain (high urgency)",
    symptoms:
      "58-year-old male. Sudden crushing chest pain radiating to my left arm. Started 20 minutes ago. I am sweating and feel nauseous.",
    age: 58,
    zip: "60540",
  },
  {
    label: "Sprained ankle (very low urgency)",
    symptoms:
      "I rolled my ankle playing basketball about an hour ago. It is swollen and bruised but I can put some weight on it.",
    age: 24,
    zip: "60540",
  },
];

export default function HomePage() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState<number>(30);
  const [zipCode, setZipCode] = useState("");
  const {
    agentUpdates,
    result,
    isStreaming,
    error,
    runTriage,
    reset,
    agentOrder,
  } = useTriageStream();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || !zipCode.trim()) return;
    await runTriage(symptoms, age, zipCode);
  };

  const handleReset = () => {
    reset();
    setSymptoms("");
    setAge(30);
    setZipCode("");
  };

  const showPanel = isStreaming || !!result || !!error;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="px-6 py-5 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">
            TriageFlow
          </span>
          <span className="text-slate-400 text-sm ml-auto">
            AI-powered care routing
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        {/* Hero */}
        {!showPanel && (
          <div className="text-center space-y-4 animate-fade-in">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(0,105,255,0.15)",
                border: "0.5px solid rgba(0,105,255,0.4)",
                borderRadius: "99px",
                padding: "4px 14px",
                fontSize: "12px",
                color: "#60a5fa",
                fontWeight: 500,
                marginBottom: "8px",
              }}
            >
              <span style={{ fontSize: "10px" }}>{"\u26A1"}</span>
              Powered by DigitalOcean Gradient&trade; AI
            </div>

            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 700,
                color: "white",
                lineHeight: 1.15,
                fontFamily: "'Instrument Serif', serif",
              }}
            >
              Know where to go.
              <br />
              <span style={{ color: "#34d399" }}>Before you go.</span>
            </h1>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "1.1rem",
                maxWidth: "420px",
                margin: "0 auto",
              }}
            >
              4 AI agents analyze your symptoms and route you to the right care
              &mdash; in under 60 seconds.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "32px",
                marginTop: "8px",
              }}
            >
              {[
                { value: "36M", label: "unnecessary ER visits/yr" },
                { value: "$38B", label: "wasted annually" },
                { value: "<60s", label: "to a routing decision" },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#34d399",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        {!result && (
          <SymptomForm
            symptoms={symptoms}
            setSymptoms={setSymptoms}
            age={age}
            setAge={setAge}
            zipCode={zipCode}
            setZipCode={setZipCode}
            onSubmit={handleSubmit}
            isStreaming={isStreaming}
          />
        )}

        {/* Demo scenarios */}
        {!showPanel && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Try a demo scenario
            </p>
            {DEMO_SCENARIOS.map((scenario) => (
              <button
                key={scenario.label}
                onClick={() => {
                  setSymptoms(scenario.symptoms);
                  setAge(scenario.age);
                  setZipCode(scenario.zip);
                }}
                className="w-full text-left text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-4 py-3 transition-colors"
              >
                {scenario.label}
              </button>
            ))}
          </div>
        )}

        {/* Agent trace panel — visible while streaming and after result */}
        {showPanel && !result && (
          <AgentTracePanel
            agentUpdates={agentUpdates}
            agentOrder={agentOrder}
            isStreaming={isStreaming}
          />
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {result.triage_score.requires_human_review && <HumanReviewAlert />}
            <AgentTracePanel
              agentUpdates={agentUpdates}
              agentOrder={agentOrder}
              isStreaming={false}
            />
            <TriageResultCard result={result} />
            <button
              onClick={handleReset}
              className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
            >
              Start new triage &rarr;
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
