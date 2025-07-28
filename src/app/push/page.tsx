import Link from "next/link";

export default function PushPage() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <h1 className="p-5">
        안녕하세요? <br />
        푸시 알림을 클릭한 경우, 이 페이지로 접속합니다.
      </h1>

      <Link href="/" className="text-blue-600 underline">
        홈으로 이동
      </Link>
    </div>
  );
}
