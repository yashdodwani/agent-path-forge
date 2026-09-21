// API Types matching backend schemas

export interface UserProfile {
  name: string;
  current_role: string;
  target_role: string;
  current_skills: string[];
  preferred_style: "Video" | "Article" | "Interactive" | "Book";
  experience_level: "Beginner" | "Intermediate" | "Advanced";
}

export interface Resource {
  title: string;
  url: string;
  type: string;
  duration: string;
  reason: string;
}

export interface Module {
  id: number;
  module_name: string;
  description: string;
  skills_covered: string[];
  resources: Resource[];
  why_needed: string;
  estimated_time: string;
}

export interface MarketTrend {
  skill: string;
  demand_level: string;
  growth_metric: string;
}

export interface AgentLog {
  agent_name: string;
  action: string;
  timestamp: string;
}

// --- Gap Analysis (resume + JD mode) ---

export interface GapSkill {
  skill: string;
  status: "Missing" | "Partial" | "Met";
  importance: "Critical" | "High" | "Medium";
  note?: string;
}

export interface GapAnalysis {
  matched_skills: string[];
  gaps: GapSkill[];
  resume_summary?: string;
  jd_summary?: string;
}

export interface RoadmapResponse {
  roadmap: Module[];
  market_analysis?: MarketTrend[];
  agent_logs?: AgentLog[];
  gap_analysis?: GapAnalysis;
  roadmap_id?: number;
}

export interface ConversationResponse {
  conversation_id: number;
  roadmap_id: number;
  created_at: string;
}

export interface Message {
  id?: string;
  sender: "user" | "assistant";
  text: string;
  timestamp?: string;
}

export interface ProgressUpdate {
  module_id: number;
  status: "not_started" | "in_progress" | "completed";
}

export interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
}

// --- Resume + Job Description intake (new flow) ---

export interface GenerateFromDocsPayload {
  name: string;
  target_role: string;
  preferred_style: UserProfile["preferred_style"];
  resume: File;
  /**
   * Provide exactly one JD source. If more than one is set, the backend
   * prefers jd_text > jd_file > job_url.
   */
  job_url?: string;
  jd_text?: string;
  jd_file?: File;
}