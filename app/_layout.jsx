import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  addNotificationResponseListenerAsync,
  configureDeviceNotificationsAsync,
} from "../lib/notifications/deviceNotifications";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const previousHtmlOverflowX = document.documentElement.style.overflowX;
    const previousBodyOverflowX = document.body.style.overflowX;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
    document.body.style.width = "100%";

    return () => {
      document.documentElement.style.overflowX = previousHtmlOverflowX;
      document.body.style.overflowX = previousBodyOverflowX;
      document.body.style.width = previousBodyWidth;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let responseSubscription = null;

    const bootstrapNotifications = async () => {
      await configureDeviceNotificationsAsync();

      if (!mounted) {
        return;
      }

      responseSubscription = await addNotificationResponseListenerAsync(() => {
        router.push("/notifications");
      });
    };

    bootstrapNotifications();

    return () => {
      mounted = false;
      responseSubscription?.remove?.();
    };
  }, [router]);

  return <Slot />;
}
