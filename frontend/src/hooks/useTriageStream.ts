"use client";
import { useState, useCallback } from "react";
import { AgentUpdate, TriageResult } from "@/lib/types";

const AGENT_ORDER = [
  "Symptom Agent",
  "Triage Agent",
  "Care Router Agent",
  "Follow-up Agent",
];

export function useTriageStream() {
  const [agentUpdates, setAgentUpdates] = useState<
    Record<string, AgentUpdate>
  >({});
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setAgentUpdates({});
    setResult(null);
    setIsStreaming(false);
    setError(null);
  }, []);

  const runTriage = useCallback(
    async (symptoms: string, age: number, zipCode: string) => {
      setIsStreaming(true);
      setError(null);
      setResult(null);
      setAgentUpdates({});

      const initial: Record<string, AgentUpdate> = {};
      AGENT_ORDER.forEach((name) => {
        initial[name] = {
          agent_name: name,
          status: "pending",
          output_preview: null,
          timestamp: new Date().toISOString(),
        };
      });
      setAgentUpdates(initial);

      try {
        const response = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symptoms, age, zip_code: zipCode }),
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        if (!response.body) throw new Error("No response stream");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (line.startsWith("event:")) continue;
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);
                if (parsed.session_id && parsed.triage_score) {
                  setResult(parsed as TriageResult);
                  setIsStreaming(false);
                } else if (parsed.agent_name) {
                  setAgentUpdates((prev) => ({
                    ...prev,
                    [parsed.agent_name]: parsed,
                  }));
                } else if (parsed.message) {
                  setError(parsed.message);
                  setIsStreaming(false);
                }
              } catch {
                // skip malformed JSON chunks
              }
            }
          }
        }

        setIsStreaming(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
        setIsStreaming(false);
      }
    },
    []
  );

  return {
    agentUpdates,
    result,
    isStreaming,
    error,
    runTriage,
    reset,
    agentOrder: AGENT_ORDER,
  };
}
