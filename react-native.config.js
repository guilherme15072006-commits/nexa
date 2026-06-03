module.exports = {
  dependencies: {
    '@shopify/react-native-skia': {
      platforms: { android: null },
    },
    // Dynamic links deprecated by Google — exclude
    '@react-native-firebase/dynamic-links': {
      platforms: { android: null, ios: null },
    },
  },
};
