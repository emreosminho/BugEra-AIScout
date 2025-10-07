/**
 * Zustand store for global application state
 */

import { create } from 'zustand';

interface AppStoreState {
  // Current page/view
  currentView: 'dashboard' | 'results' | 'settings';
  
  // Theme
  theme: 'light' | 'dark';
  
  // Settings
  settings: {
    apiKey: string;
    model: string;
    language: 'en' | 'tr';
    defaultTimeout: number;
  };
  
  // Actions
  setCurrentView: (view: 'dashboard' | 'results' | 'settings') => void;
  setTheme: (theme: 'light' | 'dark') => void;
  updateSettings: (settings: Partial<AppStoreState['settings']>) => void;
}

/**
 * Global application store
 */
export const useAppStore = create<AppStoreState>((set) => ({
  currentView: 'dashboard',
  theme: 'light',
  settings: {
    apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY || '',
    model: import.meta.env.VITE_HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2',
    language: 'tr',
    defaultTimeout: parseInt(import.meta.env.VITE_DEFAULT_TIMEOUT || '30000'),
  },

  setCurrentView: (view) => set({ currentView: view }),

  setTheme: (theme) => set({ theme }),

  updateSettings: (newSettings) =>
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    })),
}));

