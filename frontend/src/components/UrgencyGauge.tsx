"use client";

interface Props {
  score: number;
  confidence: number;
}

const SCORE_CONFIG = [
  { label: "Minimal", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
  { label: "Low", color: "#34d399", bg: "rgba(52,211,153,0.15)" },
  { label: "Moderate", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
];

export function UrgencyGauge({ score, confidence }: Props) {
  const cfg = SCORE_CONFIG[score - 1] ?? SCORE_CONFIG[0];
  const pct = (score / 5) * 100;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "20px",
        padding: "16px 20px",
        borderRadius: "12px",
        background: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        marginBottom: "4px",
      }}
    >
      <div style={{ textAlign: "center", minWidth: "60px" }}>
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: cfg.color,
            lineHeight: 1,
            fontFamily: "'Instrument Serif', serif",
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: "12px", color: cfg.color, opacity: 0.8 }}>
          out of 5
        </div>
      </div>

      <div style={{ width: "1px", height: "50px", background: `${cfg.color}30` }} />

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: cfg.color,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "6px",
          }}
        >
          {cfg.label} urgency
        </div>

        <div
          style={{
            height: "6px",
            background: "rgba(255,255,255,0.1)",
            borderRadius: "99px",
            overflow: "hidden",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: cfg.color,
              borderRadius: "99px",
              transition: "width 0.8s ease",
            }}
          />
        </div>

        <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          {Math.round(confidence * 100)}% model confidence
        </div>
      </div>
    </div>
  );
}
