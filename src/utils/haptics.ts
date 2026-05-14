import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const BASE_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Light impact — button taps, selection changes, tab switches.
 */
export function hapticLight(): void {
  ReactNativeHapticFeedback.trigger('impactLight', BASE_OPTIONS);
}

/**
 * Medium impact — card press, toggle, like/unlike.
 */
export function hapticMedium(): void {
  ReactNativeHapticFeedback.trigger('impactMedium', BASE_OPTIONS);
}

/**
 * Heavy impact — destructive actions, confirmations.
 */
export function hapticHeavy(): void {
  ReactNativeHapticFeedback.trigger('impactHeavy', BASE_OPTIONS);
}

/**
 * Success notification — post published, follow confirmed.
 */
export function hapticSuccess(): void {
  ReactNativeHapticFeedback.trigger('notificationSuccess', BASE_OPTIONS);
}

/**
 * Error notification — action failed.
 */
export function hapticError(): void {
  ReactNativeHapticFeedback.trigger('notificationError', BASE_OPTIONS);
}

/**
 * Selection tick — scrolling through options.
 */
export function hapticSelection(): void {
  ReactNativeHapticFeedback.trigger('selection', BASE_OPTIONS);
}
