"use client";
import { CareChannel, CARE_CHANNEL_CONFIG } from "@/lib/types";

interface Props {
  channel: CareChannel;
  isRecommended?: boolean;
}

export function CareOptionCard({ channel, isRecommended = false }: Props) {
  const cfg = CARE_CHANNEL_CONFIG[channel];

  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all ${
        isRecommended ? "ring-2 ring-offset-2 ring-emerald-500 scale-[1.02]" : ""
      }`}
      style={{ backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{cfg.icon}</span>
        <div>
          <p className="font-semibold text-sm" style={{ color: cfg.color }}>
            {cfg.label}
          </p>
          <p className="text-xs" style={{ color: cfg.color }}>
            {cfg.urgency}
          </p>
        </div>
      </div>
    </div>
  );
}
