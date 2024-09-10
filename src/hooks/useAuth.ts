import { useUserStore } from "@/store/userStore";
import { useLoadingStore } from "@/store/loadingStore";
import supabase from "@/utils/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";

export const useAuth = () => {
  const { user, setUser, logout: storeLogout, setPushSubscription } = useUserStore();
  const { setLoading, isLoading } = useLoadingStore();
  const router = useRouter();
  const pathname = usePathname();

  const updateUserState = useCallback(
    async (session: any | null) => {
      if (session) {
        const { id, email } = session.user;

        try {
          const { data, error } = await supabase
            .from("users")
            .select("subscription_data")
            .eq("id", id);

          if (error) throw error;

          setUser({ id, email });
          setPushSubscription(!!data[0]?.subscription_data);

          if (pathname === "/login") {
            router.push("/private");
          }
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error fetching user data:", error.message);
          } else {
            console.error("Unknown error:", error);
          }
        }
      } else {
        if (pathname !== "/login") {
          router.push("/login");
        }
        storeLogout();
      }
    },
    [pathname, router, setUser, storeLogout],
  );

  const checkUser = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await updateUserState(session);
    } catch (error) {
      console.error("Error checking user session:", error);
    } finally {
      setLoading(false);
    }
  }, [updateUserState, setLoading]);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      updateUserState(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthAction = useCallback(
    async (
      action: "signInWithPassword" | "signUp" | "signOut",
      data?: { email: string; password: string },
    ) => {
      setLoading(true);
      try {
        const { error } = await supabase.auth[action](data!);
        if (error) throw error;
      } catch (error: any) {
        console.error(`Error during ${action}:`, error.message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [],
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
    isLoading,
    checkUser,
    login,
    signup,
    logout,
  };
};
