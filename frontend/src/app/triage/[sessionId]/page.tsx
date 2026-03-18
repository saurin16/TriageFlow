"use client";

import { useParams } from "next/navigation";

export default function TriageSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-slate-400 text-sm">Session</p>
        <p className="text-white font-mono text-sm">{sessionId}</p>
        <a
          href="/"
          className="inline-block text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
        >
          &larr; Start new triage
        </a>
      </div>
    </main>
  );
}
