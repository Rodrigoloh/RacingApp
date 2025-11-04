// types.ts
// Interfaces comunes
export interface Lap {
  id: string;
  trackId: string;
  userId: string;
  totalMs: number;
  date: number;
}

export interface Track {
  id: string;
  name: string;
  createdAt: number;
}