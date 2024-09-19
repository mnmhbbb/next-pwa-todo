"use client";

import SubscriptionStatus from "@/components/SubscriptionStatus";
import { useAuth } from "@/hooks/useAuth";

export default function Push() {
  const { user } = useAuth();

  return (
    <main className="flex flex-col items-center justify-between py-12">
      <div className="flex gap-5 mb-10">
        <p>환영합니다, {user?.email}!</p>
      </div>
      <SubscriptionStatus />
    </main>
  );
}
