import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Module, Message, UserProfile } from '@/types/api';

interface ModuleProgress {
  [moduleId: number]: 'not_started' | 'in_progress' | 'completed';
}

interface AppState {
  // Roadmap data
  modules: Module[];
  moduleProgress: ModuleProgress;
  currentRoadmapId: string | null;
  
  // Conversation data
  conversationId: string | null;
  messages: Message[];
  
  // User profile
  userProfile: UserProfile | null;
  
  // UI state
  selectedModuleId: number | null;
  viewMode: '3d' | '2d';
  
  // Actions
  setModules: (modules: Module[]) => void;
  setModuleProgress: (moduleId: number, status: 'not_started' | 'in_progress' | 'completed') => void;
  setCurrentRoadmapId: (id: string | null) => void;
  setConversationId: (id: string | null) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setSelectedModuleId: (id: number | null) => void;
  setViewMode: (mode: '3d' | '2d') => void;
  resetRoadmap: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      modules: [],
      moduleProgress: {},
      currentRoadmapId: null,
      conversationId: null,
      messages: [],
      userProfile: null,
      selectedModuleId: null,
      viewMode: '3d',

      // Actions
      setModules: (modules) => {
        const progress: ModuleProgress = {};
        modules.forEach(module => {
          progress[module.id] = 'not_started';
        });
        set({ modules, moduleProgress: progress });
      },

      setModuleProgress: (moduleId, status) =>
        set((state) => ({
          moduleProgress: {
            ...state.moduleProgress,
            [moduleId]: status,
          },
        })),

      setCurrentRoadmapId: (id) => set({ currentRoadmapId: id }),
      
      setConversationId: (id) => set({ conversationId: id }),
      
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, { ...message, timestamp: new Date().toISOString() }],
        })),
      
      setMessages: (messages) => set({ messages }),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      setSelectedModuleId: (id) => set({ selectedModuleId: id }),
      
      setViewMode: (mode) => set({ viewMode: mode }),
      
      resetRoadmap: () =>
        set({
          modules: [],
          moduleProgress: {},
          currentRoadmapId: null,
          selectedModuleId: null,
        }),
    }),
    {
      name: 'edupath-storage',
      partialize: (state) => ({
        modules: state.modules,
        moduleProgress: state.moduleProgress,
        currentRoadmapId: state.currentRoadmapId,
        conversationId: state.conversationId,
        userProfile: state.userProfile,
        viewMode: state.viewMode,
      }),
    }
  )
);
