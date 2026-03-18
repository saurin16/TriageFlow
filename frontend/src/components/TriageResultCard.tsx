"use client";
import { TriageResult, CARE_CHANNEL_CONFIG } from "@/lib/types";
import { UrgencyGauge } from "./UrgencyGauge";

export function TriageResultCard({ result }: { result: TriageResult }) {
  const cfg = CARE_CHANNEL_CONFIG[result.care_route.recommended_channel];
  const isCall911 = result.care_route.recommended_channel === "call_911";

  return (
    <div className="space-y-4 animate-fade-in">
      <UrgencyGauge
        score={result.triage_score.urgency_score}
        confidence={result.triage_score.confidence}
      />

      {/* Primary recommendation */}
      <div
        className="rounded-2xl p-6 border-2"
        style={{ backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{cfg.icon}</span>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: cfg.color }}
            >
              {cfg.urgency}
            </p>
            <h2
              className="text-2xl font-bold font-serif"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </h2>
          </div>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: cfg.color }}
        >
          {result.care_route.reasoning}
        </p>
        {result.care_route.estimated_wait_minutes && (
          <p
            className="text-sm font-medium mt-2"
            style={{ color: cfg.color }}
          >
            Estimated wait: ~{result.care_route.estimated_wait_minutes} min
          </p>
        )}
        {isCall911 && (
          <a
            href="tel:911"
            className="mt-4 block w-full text-center bg-red-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-red-700 transition-colors"
          >
            Call 911 Now
          </a>
        )}
      </div>

      {/* Care steps */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3 text-sm uppercase tracking-wider">
          What to do now
        </h3>
        <ol className="space-y-2">
          {result.follow_up_plan.care_steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-slate-600">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Warning signs */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
        <h3 className="font-semibold text-amber-800 mb-3 text-sm uppercase tracking-wider">
          Go to ER immediately if
        </h3>
        <ul className="space-y-1">
          {result.follow_up_plan.warning_signs.map((sign, i) => (
            <li key={i} className="text-sm text-amber-700 flex gap-2">
              <span className="flex-shrink-0">&bull;</span>
              <span>{sign}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Clinical reasoning */}
      <details className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <summary className="text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer">
          Clinical reasoning (
          {Math.round(result.triage_score.confidence * 100)}% confidence)
        </summary>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          {result.triage_score.clinical_reasoning}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Processed in {result.processing_time_ms}ms
        </p>
      </details>
    </div>
  );
}
