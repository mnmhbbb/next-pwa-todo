import { useMutation, useQueryClient } from "@tanstack/react-query";
import { urlB64ToUint8Array } from "@/utils/utils";

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
      throw new Error("SUBSCRIPTION_NOT_FOUND");
    } else if (res.status === 401) {
      throw new Error("UNAUTHORIZED");
    } else if (res.status === 400) {
      throw new Error("INVALID_REQUEST");
    }
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

/**
 * 푸시 알림 관련 모든 mutation을 관리하는 커스텀 훅
 */
export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  // 구독하기 mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service workers are not supported");
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        await navigator.serviceWorker.register("/sw.js");
      }

      const finalRegistration = await navigator.serviceWorker.ready;

      // 기존 구독 이력이 있다면 구독 해제(중복 방지)
      const existingSubscription = await finalRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      // 새 구독 정보 생성
      const applicationServerKey = urlB64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);
      const pushSubscription = await finalRegistration.pushManager.subscribe({
        applicationServerKey,
        userVisibleOnly: true,
      });

      // API에 구독 정보 전송
      await subscribeToNotifications(pushSubscription);

      // 구독 정보 로컬 스토리지에 저장
      localStorage.setItem("subscriptionData", JSON.stringify(pushSubscription));
      return pushSubscription;
    },
    onSuccess: () => {
      alert("구독 완료");
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
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

      // API에 구독 해제 정보 전송(DB에서 삭제하기 위함)
      await unsubscribeFromNotifications(subscriptionData);

      // 로컬 스토리지에서 구독 정보 삭제
      localStorage.removeItem("subscriptionData");

      return true;
    },
    onSuccess: () => {
      alert("구독해제 완료");
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
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
      if (error.message === "SUBSCRIPTION_NOT_FOUND") {
        alert("구독 정보를 찾을 수 없습니다. 자동으로 재생성합니다.");
        regenerateSubscriptionMutation.mutate();
      } else if (error.message === "UNAUTHORIZED") {
        alert("인증 오류가 발생했습니다. VAPID 키를 확인해주세요.");
      } else if (error.message === "INVALID_REQUEST") {
        alert("잘못된 요청입니다. 입력값을 확인해주세요.");
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
      queryClient.invalidateQueries({ queryKey: ["subscription-status"] });
    },
    onError: (error) => {
      console.error("구독 재생성 중 오류:", error);
      alert(`구독 재생성 실패: ${error}`);
    },
  });

  // 통합 로딩 상태 계산
  const isAnyMutationLoading =
    subscribeMutation.isPending ||
    unsubscribeMutation.isPending ||
    sendNotificationMutation.isPending ||
    regenerateSubscriptionMutation.isPending;

  // 현재 진행 중인 작업 메시지
  const getLoadingMessage = () => {
    if (subscribeMutation.isPending) return "구독 중...";
    if (unsubscribeMutation.isPending) return "구독해제 중...";
    if (sendNotificationMutation.isPending) return "알림 전송 중...";
    if (regenerateSubscriptionMutation.isPending) return "구독 재생성 중...";
    return "";
  };

  return {
    subscribeMutation,
    unsubscribeMutation,
    sendNotificationMutation,
    regenerateSubscriptionMutation,
    isAnyMutationLoading,
    getLoadingMessage,
  };
};
