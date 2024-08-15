"use client";

import { urlB64ToUint8Array } from "@/utils/utils";
import { useEffect, useState } from "react";

enum SubscriptionStatusType {
  default = "default", // 권한을 요청할 수 있는 상태
  denied = "denied", // 권한 미승인 상태
  granted = "granted", // 권한 승인 상태
}

const SubscriptionStatus = () => {
  const [status, setStatus] = useState<SubscriptionStatusType>();

  useEffect(() => {
    const permission = Notification.permission as SubscriptionStatusType;
    setStatus(permission);
  }, []);

  const generateSubscribeEndPoint = async (newRegistration: ServiceWorkerRegistration) => {
    const applicationServerKey = urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_KEY!);
    const options = {
      applicationServerKey,
      userVisibleOnly: true,
    };
    const subscription = await newRegistration.pushManager.subscribe(options);
    console.log(subscription);
    // TODO: api 생성하여 요청
    // postSubscription(subscription)
  };

  const subscribe = async () => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          generateSubscribeEndPoint(registration);
        }
      } catch (error) {
        alert("Error during service worker registration or subscription:");
      }
    } else {
      alert("Service workers are not supported in this browser");
    }
  };

  const handleSubscription = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setStatus(permission as SubscriptionStatusType);
        if (permission === "granted") {
          subscribe();
        }
      });
    }
  };

  const handleUnSubscription = async () => {
    setStatus(SubscriptionStatusType.denied);
    const unsubscribed = await subscription.unsubscribe();
  };

  return (
    <div>
      <h1>Hello?</h1>
      subscription status: {status}
      {status === SubscriptionStatusType.granted ? (
        <button onClick={handleUnSubscription}>구독 해제</button>
      ) : (
        <button onClick={handleSubscription}>구독</button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
