"use client";

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

  return (
    <div>
      <h1>Hello?</h1>
      subscription status: {status}
    </div>
  );
};

export default SubscriptionStatus;
