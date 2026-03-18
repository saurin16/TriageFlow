"use client";
import { useEffect, useState } from "react";
import { AgentUpdate, AgentStatus } from "@/lib/types";

interface Props {
  agentUpdates: Record<string, AgentUpdate>;
  agentOrder: string[];
  isStreaming: boolean;
}

const AGENT_ICONS: Record<string, string> = {
  "Symptom Agent": "\u{1F50D}",
  "Triage Agent": "\u2695\uFE0F",
  "Care Router Agent": "\u{1F5FA}\uFE0F",
  "Follow-up Agent": "\u{1F4CB}",
};

export function AgentTracePanel({ agentUpdates, agentOrder, isStreaming }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    agentOrder.forEach((name, i) => {
      setTimeout(() => {
        setVisible((prev) => ({ ...prev, [name]: true }));
      }, i * 120);
    });
  }, [agentOrder]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "20px",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "16px",
        }}
      >
        Agent Pipeline
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {agentOrder.map((name, i) => {
          const update = agentUpdates[name];
          const status: AgentStatus = update?.status ?? "pending";
          const isVisible = visible[name];

          return (
            <div key={name}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "10px 8px",
                  borderRadius: "10px",
                  background:
                    status === "running"
                      ? "rgba(59,130,246,0.08)"
                      : status === "complete"
                        ? "rgba(16,185,129,0.06)"
                        : "transparent",
                  transition: "all 0.3s ease",
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : "translateX(-8px)",
                }}
              >
                <div style={{ position: "relative", marginTop: "4px", flexShrink: 0 }}>
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background:
                        status === "complete"
                          ? "#10b981"
                          : status === "running"
                            ? "#3b82f6"
                            : status === "error"
                              ? "#ef4444"
                              : "rgba(255,255,255,0.2)",
                      transition: "background 0.4s ease",
                      boxShadow:
                        status === "running"
                          ? "0 0 0 0 rgba(59,130,246,0.7)"
                          : status === "complete"
                            ? "0 0 6px rgba(16,185,129,0.5)"
                            : "none",
                      animation:
                        status === "running"
                          ? "pulse-ring 1.2s ease-out infinite"
                          : "none",
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px" }}>{AGENT_ICONS[name]}</span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 500,
                        color:
                          status === "pending"
                            ? "rgba(255,255,255,0.4)"
                            : "rgba(255,255,255,0.9)",
                        transition: "color 0.3s ease",
                      }}
                    >
                      {name}
                    </span>
                    {status !== "pending" && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          padding: "2px 8px",
                          borderRadius: "99px",
                          background:
                            status === "complete"
                              ? "rgba(16,185,129,0.15)"
                              : status === "running"
                                ? "rgba(59,130,246,0.15)"
                                : "rgba(239,68,68,0.15)",
                          color:
                            status === "complete"
                              ? "#34d399"
                              : status === "running"
                                ? "#60a5fa"
                                : "#f87171",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {status === "running"
                          ? "Running..."
                          : status === "complete"
                            ? "Done"
                            : "Error"}
                      </span>
                    )}
                  </div>
                  {update?.output_preview && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.4)",
                        marginTop: "4px",
                        paddingLeft: "22px",
                      }}
                    >
                      {update.output_preview}
                    </p>
                  )}
                </div>
              </div>

              {i < agentOrder.length - 1 && (
                <div
                  style={{
                    marginLeft: "16px",
                    width: "1px",
                    height: "8px",
                    background: "rgba(255,255,255,0.1)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); }
          70% { box-shadow: 0 0 0 8px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }
      `}</style>
    </div>
  );
}
