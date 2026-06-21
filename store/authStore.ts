"use client";

import { create } from "zustand";

/**
 * UI store. Auth state now lives in the real session (see `hooks/useSession`);
 * this store only holds transient UI state like the prebook modal.
 */
interface UIState {
  prebookOpen: boolean;
  setPrebookOpen: (open: boolean) => void;
}

export const useAuthStore = create<UIState>((set) => ({
  prebookOpen: false,
  setPrebookOpen: (open) => set({ prebookOpen: open }),
}));
