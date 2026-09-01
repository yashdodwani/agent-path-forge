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
  estimated_time?: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  estimated_duration: string;
  skills_covered: string[];
  resources: Resource[];
  prerequisites: number[];
  order: number;
}

export interface MarketAnalysis {
  job_demand: string;
  salary_range: string;
  key_companies: string[];
  trending_skills: string[];
}

export interface AgentLog {
  agent_name: string;
  log_message: string;
  timestamp: string;
}

export interface RoadmapResponse {
  modules: Module[];
  market_analysis?: MarketAnalysis;
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
