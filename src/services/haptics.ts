import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

const OPTIONS = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

/** Light tap — odds selection, tab switch, minor toggle */
export function hapticLight() {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactLight, OPTIONS);
}

/** Medium tap — bet confirm, copy bet, follow, like */
export function hapticMedium() {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactMedium, OPTIONS);
}

/** Heavy tap — level up, mission complete, reward overlay */
export function hapticHeavy() {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.impactHeavy, OPTIONS);
}

/** Success — check-in claimed, bet placed, challenge sent */
export function hapticSuccess() {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationSuccess, OPTIONS);
}

/** Warning — near-win pulse, urgency */
export function hapticWarning() {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationWarning, OPTIONS);
}

/** Error — bet rejected, action failed */
export function hapticError() {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.notificationError, OPTIONS);
}

/** Soft selection — scrolling through options */
export function hapticSelection() {
  ReactNativeHapticFeedback.trigger(HapticFeedbackTypes.selection, OPTIONS);
}
