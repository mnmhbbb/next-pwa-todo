import SubscriptionStatus from "@/components/SubscriptionStatus";

export default function Home() {
  return (
    <main className="w-full h-full flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold p-5">푸시 알림 테스트</h1>

      <SubscriptionStatus />
    </main>
  );
}
