"use client";

interface Props {
  score: number;
}

const SCORE_COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-800 border-emerald-200",
  2: "bg-blue-100 text-blue-800 border-blue-200",
  3: "bg-amber-100 text-amber-800 border-amber-200",
  4: "bg-orange-100 text-orange-800 border-orange-200",
  5: "bg-red-100 text-red-800 border-red-200",
};

export function UrgencyBadge({ score }: Props) {
  const colorClass = SCORE_COLORS[score] ?? SCORE_COLORS[1];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-semibold ${colorClass}`}
    >
      {score}/5
    </span>
  );
}
