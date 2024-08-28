import { User, useUserStore } from "@/store/userStore";
import { supabase as supabaseJs } from "@/utils/supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = () => {
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const supabase = createClient();

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    updateUser(user as User);
  };

  useEffect(() => {
    const { data: authListener } = supabaseJs.auth.onAuthStateChange((event, session) => {
      updateUser(session?.user as User);
      if (event === "SIGNED_IN") {
        router.push("/private");
      }
      if (event === "SIGNED_OUT") {
        console.log(event, "Signing out");
        router.push("/");
      }
    });

    checkUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateUser = (authUser: User | null) => {
    if (authUser) {
      setUser({ id: authUser.id, email: authUser.email! });
    } else {
      setUser(null);
    }
  };

  const login = async (formData: FormData) => {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
    } catch (error: any) {
      console.error("Error logging in:", error.message);
      throw error;
    } finally {
    }
  };

  const signup = async (formData: FormData) => {
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    try {
      const { error } = await supabase.auth.signUp(data);
      if (error) throw error;
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      throw error;
    } finally {
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      console.error("Error logging out:", error.message);
      throw error;
    } finally {
    }
  };

  return { user, login, signup, logout };
};
