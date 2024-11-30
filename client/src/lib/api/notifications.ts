import { API_URL } from "../constants";
import { ApiResponse } from "../types";

export const subscribeToPushNotifications = async (
  payload: PushSubscription
): Promise<ApiResponse<PushSubscription>> => {
  const response = await fetch(`${API_URL}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to subscribe to push notifications");
  }
  const result: ApiResponse<PushSubscription> = await response.json();
  return result;
};

export const unsubscribeFromPushNotifications = async (
  endpoint: string
): Promise<ApiResponse<PushSubscription>> => {
  const response = await fetch(`${API_URL}/unsubscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });

  if (!response.ok) {
    throw new Error("Failed to unsubscribe from push notifications");
  }
  const result: ApiResponse<PushSubscription> = await response.json();
  return result;
};
