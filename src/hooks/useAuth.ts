import { useUserStore } from "@/store/userStore";
import { useLoadingStore } from "@/store/loadingStore";
import supabase from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";

export const useAuth = () => {
  const { user, setUser, logout: storeLogout } = useUserStore();
  const { setLoading, isLoading } = useLoadingStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const setAuthLoading = useCallback(
    (isLoading: boolean) => setLoading("AUTH", isLoading),
    [setLoading],
  );

  const isAuthLoading = useCallback(() => isLoading("AUTH"), [isLoading]);

  const updateUserState = useCallback(
    (session: any | null) => {
      if (session) {
        const { id, email } = session.user;
        setUser({ id, email });
        if (pathname === "/login") {
          router.push("/private");
        }
      } else {
        if (pathname !== "/login") {
          router.push("/login");
        }
        storeLogout();
      }
      setIsInitialized(true);
    },
    [pathname, router, setUser, storeLogout],
  );

  const checkUser = useCallback(async () => {
    setAuthLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      updateUserState(session);
    } catch (error) {
      console.error("Error checking user session:", error);
      setIsInitialized(true);
    } finally {
      setAuthLoading(false);
    }
  }, [updateUserState, setAuthLoading]);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      updateUserState(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUser, setAuthLoading, updateUserState]);

  const handleAuthAction = useCallback(
    async (
      action: "signInWithPassword" | "signUp" | "signOut",
      data?: { email: string; password: string },
    ) => {
      setAuthLoading(true);
      try {
        const { error } = await supabase.auth[action](data!);
        if (error) throw error;
      } catch (error: any) {
        console.error(`Error during ${action}:`, error.message);
        throw error;
      } finally {
        setAuthLoading(false);
      }
    },
    [setAuthLoading],
  );

  const login = (formData: FormData) =>
    handleAuthAction("signInWithPassword", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

  const signup = (formData: FormData) =>
    handleAuthAction("signUp", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

  const logout = () => handleAuthAction("signOut");

  return {
    user,
    isLoggedIn: !!user,
    isLoading: isAuthLoading,
    isInitialized,
    login,
    signup,
    logout,
  };
};
