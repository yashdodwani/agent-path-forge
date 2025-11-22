import axios from 'axios';
import { 
  UserProfile, 
  RoadmapResponse, 
  ConversationResponse, 
  Message, 
  ProgressUpdate,
  HealthResponse 
} from '@/types/api';

const API_BASE_URL = 'https://edupath-jmx6.onrender.com/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 90000, // 90 seconds for cold starts on Render
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
    const response = await apiClient.post<RoadmapResponse>('/generate-roadmap', profile);
    return response.data;
  },
};

export const conversationApi = {
  createConversation: async (profile: UserProfile): Promise<ConversationResponse> => {
    console.log('Sending profile to /conversations:', profile);
    const response = await apiClient.post<ConversationResponse>('/conversations', profile);
    return response.data;
  },

  sendMessage: async (conversationId: string, message: Message): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/messages`, message);
  },

  updateProgress: async (conversationId: string, progress: ProgressUpdate): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/progress`, progress);
  },

  regenerateRoadmap: async (conversationId: string): Promise<RoadmapResponse> => {
    const response = await apiClient.post<RoadmapResponse>(`/conversations/${conversationId}/regenerate`);
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
