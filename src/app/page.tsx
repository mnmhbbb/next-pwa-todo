import Link from "next/link";

export default function Home() {
  return (
    <main className="flex justify-around gap-10 p-5">
      <Link href="/private">마이페이지</Link>
      <Link href="/push">푸시알림 보내기</Link>
    </main>
  );
}
