import { useEffect, useState } from "react";

import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "lib/api";
import { POST_MESSAGES, VAPID_PUBLIC_KEY } from "lib/constants";

export const usePushNotifications = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  // NOTIFICATION_RECEIVED Listener
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (
          event.data &&
          event.data.action === POST_MESSAGES.NOTIFICATION_RECEIVED
        ) {
          const audio = new Audio("notification.mp3");
          audio.play().catch((err) => {
            console.error("Error playing notification sound:", err);
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      const registration = await navigator.serviceWorker.ready;
      const currentSubscription =
        await registration.pushManager.getSubscription();
      if (currentSubscription) {
        setIsSubscribed(true);
        setSubscription(currentSubscription);
      }
    };

    checkSubscriptionStatus();
  }, []);

  const subscribe = async () => {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();
      if (!existingSubscription) {
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC_KEY,
        });
        setSubscription(newSubscription);
        setIsSubscribed(true);

        await subscribeToPushNotifications(newSubscription);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const currentSubscription =
        await registration.pushManager.getSubscription();
      if (currentSubscription) {
        await currentSubscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);

        await unsubscribeFromPushNotifications(currentSubscription.endpoint);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, subscription, isSubscribed, subscribe, unsubscribe };
};
