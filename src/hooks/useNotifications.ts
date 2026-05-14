import {useEffect} from 'react';
import {
  listenForForegroundNotifications,
  registerBackgroundNotificationHandler,
  registerForPushNotifications,
} from '../services/notifications';

export function useNotifications(): void {
  useEffect(() => {
    registerBackgroundNotificationHandler();

    registerForPushNotifications().catch(() => undefined);

    const unsubscribe = listenForForegroundNotifications(message => {
      if (__DEV__) {
        console.log('[FCM foreground]', message.notification?.title);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
