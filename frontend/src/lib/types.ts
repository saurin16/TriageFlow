export type CareChannel =
  | "home_care"
  | "telehealth"
  | "urgent_care"
  | "er"
  | "call_911";

export type AgentStatus = "pending" | "running" | "complete" | "error";

export interface AgentUpdate {
  agent_name: string;
  status: AgentStatus;
  output_preview: string | null;
  timestamp: string;
}

export interface SymptomEntities {
  body_systems: string[];
  duration_hours: number | null;
  severity_keywords: string[];
  red_flag_keywords: string[];
  age_risk_factors: string[];
  raw_summary: string;
}

export interface TriageScore {
  urgency_score: number;
  confidence: number;
  clinical_reasoning: string;
  requires_human_review: boolean;
}

export interface CareRoute {
  recommended_channel: CareChannel;
  reasoning: string;
  estimated_wait_minutes: number | null;
  telehealth_available: boolean;
  human_review_triggered: boolean;
}

export interface FollowUpPlan {
  care_steps: string[];
  warning_signs: string[];
  follow_up_hours: number;
  appointment_link: string | null;
}

export interface TriageResult {
  session_id: string;
  timestamp: string;
  symptom_entities: SymptomEntities;
  triage_score: TriageScore;
  care_route: CareRoute;
  follow_up_plan: FollowUpPlan;
  processing_time_ms: number;
}

export const CARE_CHANNEL_CONFIG: Record<
  CareChannel,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
    urgency: string;
  }
> = {
  home_care: {
    label: "Home Care",
    color: "#166534",
    bgColor: "#f0fdf4",
    borderColor: "#86efac",
    icon: "\u{1F3E0}",
    urgency: "Low urgency",
  },
  telehealth: {
    label: "Telehealth",
    color: "#1e40af",
    bgColor: "#eff6ff",
    borderColor: "#93c5fd",
    icon: "\u{1F4BB}",
    urgency: "Moderate urgency",
  },
  urgent_care: {
    label: "Urgent Care",
    color: "#92400e",
    bgColor: "#fffbeb",
    borderColor: "#fcd34d",
    icon: "\u{1F3E5}",
    urgency: "Elevated urgency",
  },
  er: {
    label: "Emergency Room",
    color: "#991b1b",
    bgColor: "#fef2f2",
    borderColor: "#fca5a5",
    icon: "\u{1F6A8}",
    urgency: "High urgency",
  },
  call_911: {
    label: "Call 911 Now",
    color: "#ffffff",
    bgColor: "#dc2626",
    borderColor: "#dc2626",
    icon: "\u{1F4DE}",
    urgency: "Life-threatening",
  },
};
