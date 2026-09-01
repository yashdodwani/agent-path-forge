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
  conversationId: number | null;
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
  setConversationId: (id: number | null) => void;
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
      viewMode: '2d',

      // Actions
      setModules: (modules) => {
        console.log('setModules called with:', modules);
        // Defensive handling: the backend may return different shapes.
        // Accept:
        // - modules as an array
        // - an object { modules: Module[] }
        // - an object { roadmap: Module[] }
        const rawArray: any[] = Array.isArray(modules)
          ? modules
          : Array.isArray((modules as any)?.modules)
          ? (modules as any).modules
          : Array.isArray((modules as any)?.roadmap)
          ? (modules as any).roadmap
          : [];

        console.log('rawArray:', rawArray);

        // Normalize incoming module objects to the app's Module shape.
        const modArray: Module[] = rawArray.map((m: any, idx: number) => ({
          id: m.id ?? idx,
          title: m.title ?? m.module_name ?? m.module_name ?? `Module ${idx + 1}`,
          description: m.description ?? m.summary ?? '',
          estimated_duration: m.estimated_duration ?? m.estimated_time ?? '',
          skills_covered: m.skills_covered ?? m.skills ?? [],
          resources: m.resources ?? m.resources_list ?? [],
          prerequisites: m.prerequisites ?? m.prereq_ids ?? [],
          order: m.order ?? m.sequence ?? idx,
        } as Module));

        console.log('Normalized modArray:', modArray);

        const progress: ModuleProgress = {};
        modArray.forEach((module) => {
          progress[module.id] = 'not_started';
        });
        set({ modules: modArray, moduleProgress: progress });
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
          conversationId: null,
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
