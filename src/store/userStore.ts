import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
}

interface UserState {
  isLoggedIn: boolean;
  user: User | null;
  isPushSubscribed: boolean;
  setUser: (user: User | null) => void;
  setPushSubscription: (isSubscribed: boolean) => void;
  logout: () => void;
}

const storeCreator: StateCreator<UserState> = (set) => ({
  isLoggedIn: false,
  user: null,
  isPushSubscribed: false,
  setUser: (user) => set({ user, isLoggedIn: !!user }),
  setPushSubscription: (isSubscribed) => set({ isPushSubscribed: isSubscribed }),
  logout: () => set({ user: null, isLoggedIn: false }),
});

export const useUserStore = create<UserState>()(devtools(storeCreator, { name: "UserStore" }));
