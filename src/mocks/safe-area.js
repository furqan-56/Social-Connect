const React = require('react');
const { View } = require('react-native');

const SafeAreaProvider = ({ children }) => React.createElement(View, { style: { flex: 1 } }, children);
const SafeAreaView = ({ children, style, edges: _e, ...props }) =>
  React.createElement(View, { style, ...props }, children);
const useSafeAreaInsets = () => ({ top: 0, bottom: 0, left: 0, right: 0 });

module.exports = { SafeAreaProvider, SafeAreaView, useSafeAreaInsets };
