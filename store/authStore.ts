"use client";

import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  prebookOpen: boolean;
  setPrebookOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  login: () => set({ isLoggedIn: true }),
  logout: () => set({ isLoggedIn: false }),
  prebookOpen: false,
  setPrebookOpen: (open) => set({ prebookOpen: open }),
}));
