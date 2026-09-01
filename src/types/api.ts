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

export interface RoadmapResponse {
  roadmap: Module[];
  market_analysis?: MarketTrend[];
  agent_logs?: AgentLog[];
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