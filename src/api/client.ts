// typescript
import axios from 'axios';
import {
  UserProfile,
  RoadmapResponse,
  ConversationResponse,
  Message,
  ProgressUpdate,
  HealthResponse,
  GenerateFromDocsPayload,
} from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000, // 600 seconds for cold starts and multi-step generation
});

// Request interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const roadmapApi = {
  generateRoadmap: async (profile: UserProfile): Promise<RoadmapResponse> => {
    const response = await apiClient.post<RoadmapResponse>('/api/v1/generate-roadmap', profile);
    console.log('generateRoadmap response:', response.data);
    return response.data;
  },

  /**
   * Resume + Job Description -> gap analysis -> dynamic roadmap.
   * Sent as multipart/form-data since file uploads are involved.
   * Provide exactly one JD source on the payload: job_url, jd_text, or
   * jd_file. If more than one is set, the backend prefers
   * jd_text > jd_file > job_url.
   */
  generateRoadmapFromDocs: async (payload: GenerateFromDocsPayload): Promise<RoadmapResponse> => {
    const form = new FormData();
    form.append('name', payload.name);
    form.append('target_role', payload.target_role);
    form.append('preferred_style', payload.preferred_style);
    form.append('resume', payload.resume);
    if (payload.job_url) form.append('job_url', payload.job_url);
    if (payload.jd_text) form.append('jd_text', payload.jd_text);
    if (payload.jd_file) form.append('jd_file', payload.jd_file);

    const response = await apiClient.post<RoadmapResponse>(
      '/api/v1/generate-roadmap-from-docs',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    console.log('generateRoadmapFromDocs response:', response.data);
    return response.data;
  },
};

export const conversationApi = {
  createConversation: async (profile: UserProfile): Promise<ConversationResponse> => {
    console.log('Sending profile to /api/v1/sessions:', profile);
    const response = await apiClient.post<ConversationResponse>('/api/v1/sessions', profile);
    return response.data;
  },

  sendMessage: async (conversationId: string, message: Message): Promise<void> => {
    await apiClient.post(`/api/v1/sessions/${conversationId}/messages`, message);
  },

  updateProgress: async (conversationId: string, progress: ProgressUpdate): Promise<void> => {
    await apiClient.post(`/api/v1/sessions/${conversationId}/progress`, progress);
  },

  regenerateRoadmap: async (conversationId: string): Promise<RoadmapResponse> => {
    const response = await apiClient.post<RoadmapResponse>(`/api/v1/sessions/${conversationId}/regenerate`);
    return response.data;
  },
};

export const healthApi = {
  checkHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get<HealthResponse>('/health');
    return response.data;
  },
};

export default apiClient;