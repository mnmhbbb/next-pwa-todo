"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import NotificationForm from "./NotificationForm";
import { useNotificationMutations } from "@/hooks/useNotificationMutations";

export enum NotificationPermission {
  default = "default", // 권한을 요청할 수 있는 상태
  denied = "denied", // 권한 미승인 상태
  granted = "granted", // 권한 승인 상태
}

/**
 * 푸시 알림 구독 상태 관리 컴포넌트
 *
 * 1. 구독 상태 확인
 * 2. 구독 생성
 * 3. 구독 해제
 * 4. 알림 전송
 * 5. 구독 재생성
 * 6. 브라우저 정보 감지
 */
const NotificationManager = () => {
  const [status, setStatus] = useState<NotificationPermission>();
  const [pushSubscriptionStatus, setPushSubscriptionStatus] = useState<string>("확인 중...");

  const {
    subscribeMutation,
    unsubscribeMutation,
    sendNotificationMutation,
    isAnyMutationLoading,
    getLoadingMessage,
  } = useNotificationMutations();

  // 구독 상태 확인
  const { data: subscriptionStatus, isLoading: isSubscriptionStatusLoading } = useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      if (!("Notification" in window)) return NotificationPermission.default;

      // 브라우저 알림 권한 확인
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
    },
  });

  // 현재 진행 중인 작업 메시지 (쿼리 로딩 포함)
  const getCurrentLoadingMessage = () => {
    if (isSubscriptionStatusLoading) return "상태 확인 중...";
    return getLoadingMessage();
  };

  useEffect(() => {
    if (subscriptionStatus) {
      setStatus(subscriptionStatus);
    }
  }, [subscriptionStatus]);

  // 푸시 구독 상태를 주기적으로 확인
  useEffect(() => {
    const checkPushSubscription = async () => {
      const status = await getPushSubscriptionStatus();
      setPushSubscriptionStatus(status);
    };

    // 초기 확인
    checkPushSubscription();

    // 상태가 변경될 때마다 재확인
    if (status === NotificationPermission.granted) {
      checkPushSubscription();
    }
  }, [status]);

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

  const handleUnSubscription = () => {
    unsubscribeMutation.mutate();
  };

  const handlePushNotification = async (formData: FormData) => {
    const title = formData.get("title") as string;
    const body = formData.get("description") as string;

    sendNotificationMutation.mutate({ title, body });
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

  // 브라우저 알림 권한 상태를 표시하는 computed 함수
  const getPermissionStatusText = (status: NotificationPermission | undefined) => {
    switch (status) {
      case NotificationPermission.granted:
        return "허용";
      case NotificationPermission.denied:
        return "거절";
      case NotificationPermission.default:
        return "미선택";
      default:
        return "확인 중...";
    }
  };

  // 푸시 구독 상태를 확인하는 함수
  const getPushSubscriptionStatus = async (): Promise<string> => {
    try {
      // 브라우저 알림 권한이 허용되지 않은 경우
      if (!("Notification" in window) || Notification.permission !== "granted") {
        return "권한 없음";
      }

      // Service Worker가 지원되지 않는 경우
      if (!("serviceWorker" in navigator)) {
        return "Service Worker 미지원";
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        return "구독";
      } else {
        return "미구독";
      }
    } catch (error) {
      console.error("푸시 구독 상태 확인 중 오류:", error);
      return "확인 실패";
    }
  };

  return (
    <div className="flex-col gap-1 p-10">
      {/* 로딩 상태 메시지 표시 */}
      {(isAnyMutationLoading || isSubscriptionStatusLoading) && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-700 font-medium">{getCurrentLoadingMessage()}</span>
          </div>
        </div>
      )}

      <div className="mb-5 text-gray-600">
        브라우저 알림 권한 상태: {getPermissionStatusText(status)}
      </div>
      <div className="mb-5 text-gray-600">푸시 알림 구독 상태: {pushSubscriptionStatus}</div>

      {!isAnyMutationLoading && status === NotificationPermission.granted ? (
        <div className="flex flex-col gap-5 justify-center">
          <button
            onClick={handleUnSubscription}
            disabled={isAnyMutationLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isAnyMutationLoading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {unsubscribeMutation.isPending ? "구독해제 중..." : "구독해제하기"}
          </button>
          <NotificationForm
            onSubmit={handlePushNotification}
            isPending={sendNotificationMutation.isPending}
            disabled={isAnyMutationLoading}
          />
        </div>
      ) : (
        <button
          onClick={handleSubscription}
          disabled={isAnyMutationLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isAnyMutationLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {subscribeMutation.isPending ? "구독 중..." : "구독하기"}
        </button>
      )}
    </div>
  );
};

export default NotificationManager;
