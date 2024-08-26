import { create } from "zustand";

interface User {
  id: string;
  email: string;
}

interface UserState {
  isLoggedIn: boolean;
  userInfo: User | null;
  isPushSubscribed: boolean;
  setUser: (user: User | null) => void;
  setPushSubscription: (isSubscribed: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  isLoggedIn: false,
  userInfo: null,
  isPushSubscribed: false,
  setUser: (user) => set({ userInfo: user, isLoggedIn: !!user }),
  setPushSubscription: (isSubscribed) => set({ isPushSubscribed: isSubscribed }),
  logout: () => set({ userInfo: null, isLoggedIn: false }),
}));
