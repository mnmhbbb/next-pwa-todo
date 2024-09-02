"use client";

import SubscriptionStatus from "@/components/SubscriptionStatus";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoggedIn, isLoading, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized) {
      console.log("Auth initialized - User:", user, "IsLoggedIn:", isLoggedIn);
    }
  }, [isInitialized, user, isLoggedIn]);

  if (!isInitialized || isLoading()) {
    return (
      <main className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between p-12">
      <div className="flex gap-5 mb-10">
        {!isLoggedIn && <Link href="/login">로그인</Link>}
        {isLoggedIn && <p>환영합니다, {user?.email}!</p>}
      </div>
      <SubscriptionStatus />
    </main>
  );
}
