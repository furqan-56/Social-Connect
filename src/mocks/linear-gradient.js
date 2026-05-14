const React = require('react');
const { View } = require('react-native');
const LinearGradient = ({ children, style, colors: _c, ...props }) =>
  React.createElement(View, { style: [{ backgroundColor: _c ? _c[0] : '#6C63FF' }, style], ...props }, children);
module.exports = LinearGradient;
module.exports.default = LinearGradient;
