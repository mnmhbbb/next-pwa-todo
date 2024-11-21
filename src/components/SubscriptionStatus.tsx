"use client";

import { useLoadingStore } from "@/store/loadingStore";
import { useUserStore } from "@/store/userStore";
import { urlB64ToUint8Array } from "@/utils/utils";
import { useEffect, useState } from "react";

export enum NotificationPermission {
  default = "default", // 권한을 요청할 수 있는 상태
  denied = "denied", // 권한 미승인 상태
  granted = "granted", // 권한 승인 상태
}

const SubscriptionStatus = () => {
  const { user, isPushSubscribed } = useUserStore();
  const { setLoading } = useLoadingStore();

  const [status, setStatus] = useState<NotificationPermission>();

  useEffect(() => {
    if ("Notification" in window) {
      const permission = Notification.permission as NotificationPermission;
      setStatus(permission);
    }
  }, []);

  const generatePushSubscription = async (registration: ServiceWorkerRegistration) => {
    const applicationServerKey = urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
    const options = {
      applicationServerKey,
      userVisibleOnly: true,
    };
    const pushSubscription = await registration.pushManager.subscribe(options);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: user?.id, pushSubscription }),
      });

      if (!res.ok) {
        setLoading(false);
        throw new Error(`HTTP error! status: ${res.status}`);
      } else {
        alert("success");
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      alert(`error: ${error}`);
    }
  };

  const subscribe = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          generatePushSubscription(registration);
        } else {
          const newRegistration = await navigator.serviceWorker.register("/sw.js");
          generatePushSubscription(newRegistration);
        }
      } catch (error) {
        setLoading(false);
        alert(`Error during service worker registration or subscription: ${error}`);
      }
    } else {
      setLoading(false);
      alert("Service workers are not supported in this browser");
    }
  };

  const handleSubscription = () => {
    setLoading(true);
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setStatus(permission as NotificationPermission);
        if (permission === "granted") {
          subscribe();
        }
      });
    }
  };

  const handleUnSubscription = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const successful = await subscription.unsubscribe();
        if (successful) {
          setStatus(NotificationPermission.default);
          const res = await fetch("/api/unsubscribe", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: user?.id }),
          });

          if (!res.ok) {
            setLoading(false);
            throw new Error("Failed to update server");
          }
          alert("Server updated successfully");
          setLoading(false);
        }
      } else {
        setLoading(false);
        console.log("No subscription to unsubscribe");
        setStatus(NotificationPermission.default);
      }
    } catch (error) {
      setLoading(false);
      console.error(`Error during unsubscription: ${error}`);
      alert(`Unsubscription failed: ${error}`);
    }
  };

  const handlePushNotification = async (formData: FormData) => {
    const dateTime = formData.get("datetime") as string;
    const dateObj = new Date(dateTime);
    const now = new Date();

    if (dateObj <= now) {
      alert("날짜 및 시간은 현재 시점보다 이후여야 합니다.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?.id,
          title: formData.get("title") as string,
          body: formData.get("description") as string,
          dateTime,
        }),
      });

      if (!res.ok) {
        setLoading(false);
        throw new Error("Failed to update server");
      }
      setLoading(false);
      res.json().then((data) => alert(data.message));
    } catch (error) {
      setLoading(false);
      console.error(`Error during unsubscription: ${error}`);
      alert(`Unsubscription failed: ${error}`);
    }
  };

  return (
    <div className="flex-col gap-1 p-10">
      <h1>
        구독 상태: {isPushSubscribed && status === NotificationPermission.granted ? "구독" : "아직"}
      </h1>
      <div className="mb-5 text-gray-600">
        db 구독 상태: {isPushSubscribed ? "구독" : "아직"} <br />
        브라우저 구독 상태:{" "}
        {status === NotificationPermission.granted
          ? "승인"
          : status === NotificationPermission.denied
          ? "거절"
          : "기본 상태"}
      </div>

      {isPushSubscribed && status === NotificationPermission.granted ? (
        <div className="flex flex-col gap-5 justify-center">
          <button onClick={handleUnSubscription}>구독해제하기</button>
          <div className="flex justify-center">
            <form className="bg-white p-8 rounded-lg shadow-md w-80">
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
                  제목:
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
                  내용:
                </label>
                <div className="relative">
                  <input
                    id="description"
                    name="description"
                    type="text"
                    required
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label htmlFor="datetime" className="block text-gray-700 text-sm font-bold mb-2">
                  알림 예약:
                </label>
                <div className="relative">
                  <input
                    id="datetime"
                    name="datetime"
                    type="datetime-local"
                    required
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-col space-y-4">
                <button
                  formAction={handlePushNotification}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  알림 전송
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <button onClick={handleSubscription}>구독하기</button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
