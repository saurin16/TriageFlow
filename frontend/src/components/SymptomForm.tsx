"use client";

interface Props {
  symptoms: string;
  setSymptoms: (v: string) => void;
  age: number;
  setAge: (v: number) => void;
  zipCode: string;
  setZipCode: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
}

export function SymptomForm({
  symptoms,
  setSymptoms,
  age,
  setAge,
  zipCode,
  setZipCode,
  onSubmit,
  isStreaming,
}: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Describe your symptoms
        </label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          placeholder="e.g. My 4-year-old has had a fever of 102°F for 6 hours and is pulling at her left ear..."
          rows={4}
          disabled={isStreaming}
          className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Patient age
          </label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            min={0}
            max={120}
            disabled={isStreaming}
            className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ZIP code
          </label>
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="e.g. 60540"
            disabled={isStreaming}
            className="w-full bg-white/5 border border-white/20 rounded-xl p-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isStreaming || !symptoms.trim() || !zipCode.trim()}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
      >
        {isStreaming ? "Analyzing symptoms..." : "Get care recommendation \u2192"}
      </button>

      <p className="text-xs text-slate-500 text-center">
        Not a diagnosis. TriageFlow helps you find the right care level —
        always call 911 for life-threatening emergencies.
      </p>
    </form>
  );
}
