"use client";

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
        throw new Error(`HTTP error! status: ${res.status}`);
      } else {
        alert("success");
      }
    } catch (error) {
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
        alert(`Error during service worker registration or subscription: ${error}`);
      }
    } else {
      alert("Service workers are not supported in this browser");
    }
  };

  const handleSubscription = () => {
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
            throw new Error("Failed to update server");
          }
          alert("Server updated successfully");
        }
      } else {
        console.log("No subscription to unsubscribe");
        setStatus(NotificationPermission.default);
      }
    } catch (error) {
      console.error(`Error during unsubscription: ${error}`);
      alert(`Unsubscription failed: ${error}`);
    }
  };

  const handlePushNotification = async (formData: FormData) => {
    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user?.id,
          title: formData.get("title") as string,
          body: formData.get("description") as string,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update server");
      }
    } catch (error) {
      console.error(`Error during unsubscription: ${error}`);
      alert(`Unsubscription failed: ${error}`);
    }
  };

  return (
    <div>
      <h1>Hello?</h1>
      <p>구독 상태: {isPushSubscribed ? "구독" : "아직"}</p>
      subscription status: {status}
      {status === NotificationPermission.granted ? (
        <div className="flex flex-col gap-5">
          <button onClick={handleUnSubscription}>구독해제</button>
          <div>
            <div className="flex justify-center min-h-screen ">
              <form className="bg-white p-8 rounded-lg shadow-md w-96">
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
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
                  <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
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
        </div>
      ) : (
        <button onClick={handleSubscription}>구독하기</button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
