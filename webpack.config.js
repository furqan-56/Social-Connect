const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const appDirectory = path.resolve(__dirname);

const babelLoaderConfig = {
  test: /\.(js|jsx|ts|tsx)$/,
  include: [
    path.resolve(appDirectory, 'index.js'),
    path.resolve(appDirectory, 'App.tsx'),
    path.resolve(appDirectory, 'src'),
    path.resolve(appDirectory, 'node_modules/react-native-vector-icons'),
    path.resolve(appDirectory, 'node_modules/react-native-safe-area-context'),
    path.resolve(appDirectory, 'node_modules/react-native-screens'),
    path.resolve(appDirectory, 'node_modules/react-native-reanimated'),
    path.resolve(appDirectory, 'node_modules/@react-navigation'),
    path.resolve(appDirectory, 'node_modules/react-native-haptic-feedback'),
    path.resolve(appDirectory, 'node_modules/react-native-linear-gradient'),
    path.resolve(appDirectory, 'node_modules/react-native-image-picker'),
    path.resolve(appDirectory, 'node_modules/@reduxjs'),
    path.resolve(appDirectory, 'node_modules/react-redux'),
    path.resolve(appDirectory, 'node_modules/formik'),
    path.resolve(appDirectory, 'node_modules/socket.io-client'),
  ],
  use: {
    loader: 'babel-loader',
    options: {
      presets: ['@react-native/babel-preset'],
      plugins: ['react-native-web'],
    },
  },
};

module.exports = {
  entry: path.resolve(appDirectory, 'index.web.js'),
  output: {
    filename: 'bundle.web.js',
    path: path.resolve(appDirectory, 'web-build'),
  },
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
    alias: {
      'react-native$': 'react-native-web',
      // Mock native-only modules
      '@react-native-firebase/app': path.resolve(__dirname, 'src/mocks/firebase.js'),
      '@react-native-firebase/auth': path.resolve(__dirname, 'src/mocks/firebase-auth.js'),
      '@react-native-firebase/firestore': path.resolve(__dirname, 'src/mocks/firebase-firestore.js'),
      '@react-native-firebase/messaging': path.resolve(__dirname, 'src/mocks/firebase-messaging.js'),
      'react-native-haptic-feedback': path.resolve(__dirname, 'src/mocks/haptics.js'),
      'react-native-linear-gradient': path.resolve(__dirname, 'src/mocks/linear-gradient.js'),
      'react-native-image-picker': path.resolve(__dirname, 'src/mocks/image-picker.js'),
      'react-native-vector-icons/Feather': path.resolve(__dirname, 'src/mocks/feather-icons.js'),
      'react-native-screens': path.resolve(__dirname, 'src/mocks/screens.js'),
      'react-native-safe-area-context': path.resolve(__dirname, 'src/mocks/safe-area.js'),
    },
  },
  module: {
    rules: [
      babelLoaderConfig,
      {
        test: /\.(png|jpg|gif|svg|ttf|otf|woff|woff2|eot)$/,
        use: { loader: 'url-loader', options: { limit: 8192 } },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(appDirectory, 'web/index.html'),
    }),
  ],
  devServer: {
    port: 3000,
    hot: true,
    open: true,
  },
  mode: 'development',
  devtool: 'source-map',
};
