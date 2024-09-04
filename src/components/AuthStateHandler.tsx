"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation"; // next/navigation에서 useRouter를 가져옵니다
import { useAuth } from "@/hooks/useAuth";

const AuthStateHandler = () => {
  const pathname = usePathname();
  const { checkUser } = useAuth();

  useEffect(() => {
    // 페이지 이동 시마다 로그인 상태 확인
    const handleRouteChange = () => {
      checkUser(); // 로그인 상태 갱신
    };

    handleRouteChange();
  }, [pathname, checkUser]);

  return null;
};

export default AuthStateHandler;
