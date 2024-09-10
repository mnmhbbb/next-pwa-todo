"use client";

import { useLoadingStore } from "@/store/loadingStore";
import { useEffect } from "react";

const Pwa = () => {
  const { setLoading } = useLoadingStore();
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      setLoading(true);

      window.addEventListener("load", () => {
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
      });
    }
  }, []);
  return <></>;
};

export default Pwa;
