module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: {
    '@react-native-firebase/app': '<rootDir>/__mocks__/@react-native-firebase/app.js',
    '@react-native-firebase/auth': '<rootDir>/__mocks__/@react-native-firebase/auth.js',
    '@react-native-firebase/firestore':
      '<rootDir>/__mocks__/@react-native-firebase/firestore.js',
    '@react-native-firebase/messaging':
      '<rootDir>/__mocks__/@react-native-firebase/messaging.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens|react-native-image-picker)/)',
  ],
};
