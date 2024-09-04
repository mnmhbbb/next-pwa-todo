"use client";

import SubscriptionStatus from "@/components/SubscriptionStatus";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Home() {
  const { user, isLoggedIn, logout } = useAuth();

  return (
    <main className="flex flex-col items-center justify-between p-12">
      <div className="flex gap-5 mb-10">
        {!isLoggedIn && <Link href="/login">로그인</Link>}
        {isLoggedIn && (
          <>
            <p>환영합니다, {user?.email}!</p>
            <button onClick={logout}>로그아웃</button>
          </>
        )}
      </div>
      <SubscriptionStatus />
    </main>
  );
}
