import SubscriptionStatus from "@/components/SubscriptionStatus";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-12">
      <div className="flex gap-5 mb-10">
        <Link href="/login">로그인</Link>
      </div>
      <SubscriptionStatus />
    </main>
  );
}
