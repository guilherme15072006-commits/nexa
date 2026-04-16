/**
 * @format
 */

// URL polyfill DEVE ser o primeiro import — resolve crash do Supabase no Hermes
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// FCM background handler (must be top-level, outside component)
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // Background messages are handled by the OS notification tray.
    // When user taps, onNotificationOpenedApp / getInitialNotification fires.
    if (__DEV__) {
      console.log('[Push] Background message:', remoteMessage.notification?.title);
    }
  });
} catch {
  // Firebase messaging not available (dev/no google-services.json)
}

AppRegistry.registerComponent(appName, () => App);
