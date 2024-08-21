import SubscriptionStatus from "@/components/SubscriptionStatus";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between p-12">
      <div className="flex gap-5 mb-10">
        <Link href="/sign-in">로그인</Link>
        <Link href="/sign-up">회원가입</Link>
      </div>
      <SubscriptionStatus />
    </main>
  );
}
