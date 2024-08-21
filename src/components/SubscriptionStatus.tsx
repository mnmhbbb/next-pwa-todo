"use client";

import { urlB64ToUint8Array } from "@/utils/utils";
import { useEffect, useState } from "react";

export enum NotificationPermission {
  default = "default", // 권한을 요청할 수 있는 상태
  denied = "denied", // 권한 미승인 상태
  granted = "granted", // 권한 승인 상태
}

const SubscriptionStatus = () => {
  const [status, setStatus] = useState<NotificationPermission>();
  const [userId, setUserId] = useState();

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
        body: JSON.stringify(pushSubscription),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUserId(data.userId);
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
            body: JSON.stringify({ id: userId }), // TEMP
          });

          if (!res.ok) {
            throw new Error("Failed to update server");
          }
          console.log("Server updated successfully");
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

  const handlePushNotification = async () => {
    try {
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }), // TEMP
      });

      if (!res.ok) {
        throw new Error("Failed to update server");
      }
      alert("[send] Server updated successfully");
    } catch (error) {
      console.error(`Error during unsubscription: ${error}`);
      alert(`Unsubscription failed: ${error}`);
    }
  };

  return (
    <div>
      <h1>Hello?</h1>
      subscription status: {status}
      {status === NotificationPermission.granted ? (
        <>
          <button onClick={handleUnSubscription}>구독해제</button>
          <button onClick={handlePushNotification}>푸시알림</button>
        </>
      ) : (
        <button onClick={handleSubscription}>구독하기</button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
