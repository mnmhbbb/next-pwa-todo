"use client";

import { urlB64ToUint8Array } from "@/utils/utils";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

export enum NotificationPermission {
  default = "default", // 권한을 요청할 수 있는 상태
  denied = "denied", // 권한 미승인 상태
  granted = "granted", // 권한 승인 상태
}

// API 함수들
const subscribeToNotifications = async (pushSubscription: PushSubscription) => {
  const res = await fetch("/api/subscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pushSubscription }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

const unsubscribeFromNotifications = async (subscriptionData: string | null) => {
  const res = await fetch("/api/unsubscribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ subscriptionData }),
  });

  if (!res.ok) {
    throw new Error("Failed to update server");
  }

  return res.json();
};

const sendPushNotification = async ({ title, body }: { title: string; body: string }) => {
  const res = await fetch("/api/send-notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, body }),
  });

  if (!res.ok) {
    if (res.status === 410) {
      throw new Error("SUBSCRIPTION_EXPIRED");
    }
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

const SubscriptionStatus = () => {
  const [status, setStatus] = useState<NotificationPermission>();

  // 구독 상태 확인
  const { data: subscriptionStatus } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      if ("Notification" in window) {
        const permission = Notification.permission as NotificationPermission;

        // 권한이 승인된 경우에만 실제 구독 상태 확인
        if (permission === NotificationPermission.granted) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            // 실제 구독이 있는지 확인
            if (subscription) {
              return NotificationPermission.granted;
            } else {
              // 권한은 있지만 구독이 없는 경우
              return NotificationPermission.default;
            }
          } catch (error) {
            console.error("구독 상태 확인 중 오류:", error);
            return NotificationPermission.default;
          }
        }

        return permission;
      }
      return NotificationPermission.default;
    },
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 구독하기 mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          await navigator.serviceWorker.register("/sw.js");
        }

        const finalRegistration = await navigator.serviceWorker.ready;

        // 기존 구독 해제
        const existingSubscription = await finalRegistration.pushManager.getSubscription();
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
        }

        // 새 구독 생성
        const applicationServerKey = urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
        const pushSubscription = await finalRegistration.pushManager.subscribe({
          applicationServerKey,
          userVisibleOnly: true,
        });

        // 서버에 구독 정보 전송
        await subscribeToNotifications(pushSubscription);

        localStorage.setItem("subscriptionData", JSON.stringify(pushSubscription));
        return pushSubscription;
      }
      throw new Error("Service workers are not supported");
    },
    onSuccess: () => {
      setStatus(NotificationPermission.granted);
    },
    onError: (error) => {
      console.error("구독 생성 중 오류:", error);
      alert(`구독 오류: ${error}`);
    },
  });

  // 구독해제 mutation
  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const successful = await subscription.unsubscribe();
        if (!successful) {
          throw new Error("Failed to unsubscribe");
        }
      }

      const subscriptionData = localStorage.getItem("subscriptionData");
      await unsubscribeFromNotifications(subscriptionData);

      localStorage.removeItem("subscriptionData");
      return true;
    },
    onSuccess: () => {
      alert("구독해제 완료");
      setStatus(NotificationPermission.default);
    },
    onError: (error) => {
      console.error("구독해제 중 오류:", error);
      alert(`구독해제 실패: ${error}`);
    },
  });

  // 알림 전송 mutation
  const sendNotificationMutation = useMutation({
    mutationFn: sendPushNotification,
    onSuccess: () => {
      alert("알림이 성공적으로 전송되었습니다!");
    },
    onError: (error: Error) => {
      if (error.message === "SUBSCRIPTION_EXPIRED") {
        alert("구독이 만료되었습니다. 자동으로 재생성합니다.");
        regenerateSubscriptionMutation.mutate();
      } else {
        console.error("알림 전송 중 오류:", error);
        alert(`알림 전송 실패: ${error.message}`);
      }
    },
  });

  // 구독 재생성 mutation (만료된 경우)
  const regenerateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const registration = await navigator.serviceWorker.ready;
      const applicationServerKey = urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
      const pushSubscription = await registration.pushManager.subscribe({
        applicationServerKey,
        userVisibleOnly: true,
      });

      await subscribeToNotifications(pushSubscription);
      localStorage.setItem("subscriptionData", JSON.stringify(pushSubscription));
      return pushSubscription;
    },
    onSuccess: () => {
      alert("구독이 재생성되었습니다. 다시 알림을 전송해주세요.");
      setStatus(NotificationPermission.granted);
    },
    onError: (error) => {
      console.error("구독 재생성 중 오류:", error);
      alert(`구독 재생성 실패: ${error}`);
    },
  });

  useEffect(() => {
    if (subscriptionStatus) {
      setStatus(subscriptionStatus);
    }
  }, [subscriptionStatus]);

  const handleSubscription = () => {
    if ("Notification" in window) {
      // 권한이 거절된 상태라면 사용자에게 안내
      if (Notification.permission === "denied") {
        const browserInfo = getBrowserInfo();
        const instructions = getPermissionInstructions(browserInfo);

        const shouldRetry = confirm(
          "브라우저에서 알림 권한이 거절되었습니다.\n\n" +
            "브라우저 설정에서 알림 권한을 허용한 후 페이지를 새로고침해주세요.\n\n" +
            `설정 방법 (${browserInfo.name}):\n${instructions}\n\n` +
            "설정 완료 후 페이지를 새로고침하고 다시 시도해주세요.",
        );

        if (shouldRetry) {
          // 브라우저 정책상 거절된 권한은 프로그래밍적으로 재요청 불가
          // 사용자가 수동으로 설정 변경 후 새로고침 필요
          alert("브라우저 설정에서 알림 권한을 허용한 후 페이지를 새로고침해주세요.");
        }
      } else {
        // 기본 권한 요청
        Notification.requestPermission().then((permission) => {
          setStatus(permission as NotificationPermission);
          if (permission === "granted") {
            subscribeMutation.mutate();
          }
        });
      }
    }
  };

  // 브라우저 정보 감지
  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) {
      return { name: "Chrome", type: "chrome" };
    } else if (userAgent.includes("Firefox")) {
      return { name: "Firefox", type: "firefox" };
    } else if (userAgent.includes("Safari")) {
      return { name: "Safari", type: "safari" };
    } else if (userAgent.includes("Edge")) {
      return { name: "Edge", type: "edge" };
    }
    return { name: "브라우저", type: "unknown" };
  };

  // 브라우저별 권한 설정 안내
  const getPermissionInstructions = (browserInfo: { name: string; type: string }) => {
    switch (browserInfo.type) {
      case "chrome":
        return "1. 주소창 왼쪽 자물쇠 아이콘 클릭\n2. '알림' → '허용' 선택\n3. 페이지 새로고침";
      case "firefox":
        return "1. 주소창 왼쪽 자물쇠 아이콘 클릭\n2. '알림' → '허용' 선택\n3. 페이지 새로고침";
      case "safari":
        return "1. Safari 메뉴 → 환경설정\n2. 웹사이트 → 알림\n3. 이 사이트를 '허용'으로 설정\n4. 페이지 새로고침";
      case "edge":
        return "1. 주소창 왼쪽 자물쇠 아이콘 클릭\n2. '알림' → '허용' 선택\n3. 페이지 새로고침";
      default:
        return "1. 브라우저 설정에서 알림 권한 허용\n2. 페이지 새로고침";
    }
  };

  const handleUnSubscription = () => {
    unsubscribeMutation.mutate();
  };

  const handlePushNotification = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const body = formData.get("description") as string;

    sendNotificationMutation.mutate({ title, body });
  };

  return (
    <div className="flex-col gap-1 p-10">
      <div className="mb-5 text-gray-600">
        푸시 알림 구독 상태:{" "}
        {status === NotificationPermission.granted
          ? "구독 중"
          : status === NotificationPermission.denied
          ? "구독 권한 거절 상태"
          : "구독 필요"}
      </div>

      {status === NotificationPermission.granted ? (
        <div className="flex flex-col gap-5 justify-center">
          <button onClick={handleUnSubscription} disabled={unsubscribeMutation.isPending}>
            {unsubscribeMutation.isPending ? "구독해제 중..." : "구독해제하기"}
          </button>
          <div className="flex justify-center">
            <form className="bg-white p-8 rounded-lg shadow-md w-80">
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
                  disabled={sendNotificationMutation.isPending}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                >
                  {sendNotificationMutation.isPending ? "전송 중..." : "알림 전송"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <button onClick={handleSubscription} disabled={subscribeMutation.isPending}>
          {subscribeMutation.isPending ? "구독 중..." : "구독하기"}
        </button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
