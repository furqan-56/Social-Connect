import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {auth, firestore} from '../config/firebase';

type MessagingFactory = typeof import('@react-native-firebase/messaging').default;

export type SocialNotificationPayload = {
  actorName: string;
  postId: string;
  targetUserId: string;
  type: 'like' | 'comment';
};

declare const process: {env: {NODE_ENV: string}};

function getMessaging(): MessagingFactory | null {
  if (process.env.NODE_ENV === 'test') {
    return null;
  }

  // React Native Firebase is native-backed, so keep it out of Jest startup.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('@react-native-firebase/messaging').default;
}

export async function registerForPushNotifications() {
  const messaging = getMessaging();

  if (!messaging) {
    return null;
  }

  await messaging().registerDeviceForRemoteMessages();
  const authorizationStatus = await messaging().requestPermission();
  const enabled =
    authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    return null;
  }

  const token = await messaging().getToken();

  // Persist FCM token so Cloud Functions can target this device.
  const uid = auth().currentUser?.uid;
  if (uid && token) {
    try {
      await firestore().collection('users').doc(uid).update({fcmToken: token});
    } catch {
      // Token storage is best-effort; don't block app startup.
    }
  }

  return token;
}

export function listenForForegroundNotifications(
  onNotification: (message: FirebaseMessagingTypes.RemoteMessage) => void,
) {
  const messaging = getMessaging();

  if (!messaging) {
    return () => undefined;
  }

  return messaging().onMessage(onNotification);
}

export function registerBackgroundNotificationHandler() {
  const messaging = getMessaging();

  if (!messaging) {
    return;
  }

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    return remoteMessage;
  });
}

export async function sendInteractionNotification({
  actorName,
  postId,
  targetUserId,
  type,
}: SocialNotificationPayload) {
  const title =
    type === 'like'
      ? `${actorName} liked your post`
      : `${actorName} commented on your post`;

  return {
    data: {postId, targetUserId, type},
    title,
  };
}
