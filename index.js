/**
 * @format
 */

// URL polyfill DEVE ser o primeiro import — resolve crash do Supabase no Hermes
import 'react-native-url-polyfill/auto';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
