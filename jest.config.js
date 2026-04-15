module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@shopify|zustand|@supabase)/)',
  ],
  moduleNameMapper: {
    '\.(png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFiles: ['<rootDir>/__mocks__/setup.js'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/'],
};
