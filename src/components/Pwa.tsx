"use client";

import { useLoadingStore } from "@/store/loadingStore";
import { useEffect } from "react";

const Pwa = () => {
  const { setLoading } = useLoadingStore();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      setLoading(true);

      const handleLoad = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Service Worker registration failed:", err);
            setLoading(false);
          });
      };

      // 이미 로드된 경우 즉시 실행
      if (document.readyState === "complete") {
        handleLoad();
      } else {
        // 아직 로드되지 않은 경우 이벤트 리스너 등록
        window.addEventListener("load", handleLoad);
      }

      // 클린업 함수
      return () => {
        window.removeEventListener("load", handleLoad);
      };
    }
  }, [setLoading]);

  return <></>;
};

export default Pwa;
