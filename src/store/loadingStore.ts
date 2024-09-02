import { create } from "zustand";

type LoadingKey = "AUTH"; // enum처럼 사용

interface LoadingState {
  loadingStates: Record<LoadingKey, boolean>;
  setLoading: (key: LoadingKey, isLoading: boolean) => void;
  isLoading: (key: LoadingKey) => boolean;
  isAnyLoading: () => boolean;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  loadingStates: {
    AUTH: false,
  },
  setLoading: (key, isLoading) =>
    set((state) => {
      if (state.loadingStates[key] === isLoading) return state; // 상태가 변경되지 않은 경우 set 호출 방지
      return {
        loadingStates: {
          ...state.loadingStates,
          [key]: isLoading,
        },
      };
    }),
  isLoading: (key) => get().loadingStates[key] || false,
  isAnyLoading: () => Object.values(get().loadingStates).some(Boolean),
}));
