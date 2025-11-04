// store.ts
// Estado global con Zustand
import { create } from "zustand";

interface AppState {
  user?: string;
  track?: string;
  setUser: (u: string) => void;
  setTrack: (t: string) => void;
}

export const useApp = create<AppState>((set) => ({
  user: undefined,
  track: undefined,
  setUser: (user) => set({ user }),
  setTrack: (track) => set({ track }),
}));