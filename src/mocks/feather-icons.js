const React = require('react');
const { Text } = require('react-native');

// Feather icon name → unicode/emoji fallback map
const ICONS = {
  home: '⌂', search: '⌕', bell: '🔔', user: '👤', plus: '+', x: '✕',
  heart: '♡', 'message-circle': '💬', share: '↑', bookmark: '🔖',
  camera: '📷', image: '🖼', video: '📹', smile: '😊', 'map-pin': '📍',
  tag: '🏷', globe: '🌐', users: '👥', lock: '🔒', mail: '✉',
  'arrow-left': '←', 'chevron-left': '‹', 'chevron-down': '⌄',
  edit: '✎', settings: '⚙', 'log-out': '→', 'more-horizontal': '•••',
  'more-vertical': '⋮', grid: '⊞', send: '➤', 'check-circle': '✓',
  'alert-circle': '⚠', 'eye': '👁', 'eye-off': '🙈',
  'at-sign': '@', shield: '🛡', 'share-2': '↗', compass: '🧭',
  'user-plus': '👤+', 'message-square': '💬', hash: '#',
  'chevron-right': '›', trash: '🗑', 'trash-2': '🗑',
};

const Feather = ({ name, size = 16, color = '#000', style }) =>
  React.createElement(Text, {
    style: [{ fontSize: size * 0.75, color, lineHeight: size }, style],
  }, ICONS[name] || '•');

module.exports = Feather;
module.exports.default = Feather;
