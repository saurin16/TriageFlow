"use client";

export function HumanReviewAlert() {
  return (
    <div className="bg-red-600 text-white rounded-2xl p-4 flex gap-3 items-start animate-fade-in">
      <span className="text-xl flex-shrink-0" role="img" aria-label="alert">
        &#x1F6A8;
      </span>
      <div>
        <p className="font-bold text-sm">Human review triggered</p>
        <p className="text-sm text-red-100 mt-0.5">
          This case has been flagged for clinical supervisor review due to high
          urgency score. Do not wait for review — follow the recommendation
          below immediately.
        </p>
      </div>
    </div>
  );
}
