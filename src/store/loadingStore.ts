import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

interface LoadingState {
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
}

const storeCreator: StateCreator<LoadingState> = (set) => ({
  isLoading: false,
  setLoading: (isLoading) => set({ isLoading }),
});

export const useLoadingStore = create<LoadingState>()(
  devtools(storeCreator, { name: "LoadingStore" }),
);
