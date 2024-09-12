"use client";

import { useUserStore } from "@/store/userStore";
import Link from "next/link";

const Header = () => {
  const { isLoggedIn, logout } = useUserStore();

  return (
    <nav className="w-100 flex justify-between py-3 px-2 bg-zinc-200">
      <Link className="flex justify-center items-center" href="/">
        Home
      </Link>
      {isLoggedIn ? <button onClick={logout}>로그아웃</button> : <Link href="/login">로그인</Link>}
    </nav>
  );
};

export default Header;
