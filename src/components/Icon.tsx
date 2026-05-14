import React from 'react';
import {Text, View} from 'react-native';

export type IconName =
  | 'home'
  | 'home-filled'
  | 'search'
  | 'plus'
  | 'bell'
  | 'bell-filled'
  | 'user'
  | 'heart'
  | 'heart-filled'
  | 'comment'
  | 'share'
  | 'bookmark'
  | 'bookmark-filled'
  | 'back'
  | 'close'
  | 'more'
  | 'chevron-right'
  | 'chevron-down'
  | 'mail'
  | 'lock'
  | 'eye'
  | 'eye-off'
  | 'check'
  | 'camera'
  | 'settings'
  | 'moon'
  | 'edit'
  | 'trash'
  | 'grid'
  | 'image'
  | 'location'
  | 'person-add'
  | 'flag'
  | 'link'
  | 'at'
  | 'hash'
  | 'send'
  | 'dots-horizontal'
  | 'smile';

type IconProps = {
  color?: string;
  name: IconName;
  size?: number;
};

function HomeIcon({color, size}: {color: string; size: number}) {
  const sw = Math.max(1.5, size * 0.085);
  const roofH = size * 0.42;
  const wallW = size * 0.58;
  const wallH = size * 0.46;
  const wallL = (size - wallW) / 2;
  const doorW = size * 0.22;
  const doorH = size * 0.3;
  return (
    <View style={{height: size, width: size}}>
      <View
        style={{
          borderBottomColor: color,
          borderBottomWidth: roofH,
          borderLeftColor: 'transparent',
          borderLeftWidth: size / 2,
          borderRightColor: 'transparent',
          borderRightWidth: size / 2,
          borderStyle: 'solid',
          height: 0,
          position: 'absolute',
          top: 0,
          width: 0,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderRadius: 1,
          bottom: 0,
          height: wallH,
          left: wallL,
          position: 'absolute',
          width: wallW,
        }}
      />
      <View
        style={{
          backgroundColor: 'transparent',
          borderColor: color,
          borderRadius: 2,
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          borderWidth: sw,
          bottom: 0,
          height: doorH,
          left: (size - doorW) / 2,
          position: 'absolute',
          width: doorW,
        }}
      />
    </View>
  );
}

function SearchIcon({color, size}: {color: string; size: number}) {
  const circleSize = size * 0.62;
  const sw = Math.max(1.5, size * 0.1);
  const handleLen = size * 0.34;
  return (
    <View style={{height: size, width: size}}>
      <View
        style={{
          borderColor: color,
          borderRadius: circleSize / 2,
          borderWidth: sw,
          height: circleSize,
          left: 0,
          position: 'absolute',
          top: 0,
          width: circleSize,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          bottom: 0,
          height: sw,
          position: 'absolute',
          right: 0,
          transform: [{rotate: '-45deg'}, {translateY: -handleLen / 2 + sw / 2}],
          width: handleLen,
        }}
      />
    </View>
  );
}

function BellIcon({color, size, filled}: {color: string; filled?: boolean; size: number}) {
  const sw = Math.max(1.5, size * 0.09);
  const bodyW = size * 0.62;
  const bodyH = size * 0.6;
  const bodyL = (size - bodyW) / 2;
  return (
    <View style={{height: size, width: size}}>
      <View
        style={{
          backgroundColor: filled ? color : 'transparent',
          borderColor: color,
          borderRadius: 4,
          borderTopLeftRadius: bodyW / 2,
          borderTopRightRadius: bodyW / 2,
          borderWidth: filled ? 0 : sw,
          height: bodyH,
          left: bodyL,
          position: 'absolute',
          top: size * 0.1,
          width: bodyW,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderRadius: 1,
          height: sw,
          left: 0,
          position: 'absolute',
          top: size * 0.62,
          width: size,
        }}
      />
      <View
        style={{
          borderColor: color,
          borderRadius: size * 0.1,
          borderWidth: sw,
          bottom: 0,
          height: size * 0.22,
          left: (size - size * 0.3) / 2,
          position: 'absolute',
          width: size * 0.3,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          borderRadius: size * 0.06,
          height: size * 0.12,
          left: (size - size * 0.12) / 2,
          position: 'absolute',
          top: size * 0.02,
          width: size * 0.12,
        }}
      />
    </View>
  );
}

function UserIcon({color, size}: {color: string; size: number}) {
  const sw = Math.max(1.5, size * 0.09);
  const headSize = size * 0.38;
  const bodyW = size * 0.56;
  const bodyH = size * 0.32;
  return (
    <View style={{height: size, width: size}}>
      <View
        style={{
          borderColor: color,
          borderRadius: headSize / 2,
          borderWidth: sw,
          height: headSize,
          left: (size - headSize) / 2,
          position: 'absolute',
          top: size * 0.04,
          width: headSize,
        }}
      />
      <View
        style={{
          borderColor: color,
          borderRadius: bodyW / 2,
          borderWidth: sw,
          bottom: 0,
          height: bodyH,
          left: (size - bodyW) / 2,
          position: 'absolute',
          width: bodyW,
        }}
      />
    </View>
  );
}

const SIMPLE_CHARS: Partial<Record<IconName, string>> = {
  back: '←',
  close: '✕',
  plus: '+',
  more: '⋮',
  'chevron-right': '›',
  'chevron-down': '⌄',
  mail: '✉',
  lock: '⚿',
  eye: '◎',
  'eye-off': '⊘',
  check: '✓',
  camera: '⬡',
  settings: '⚙',
  moon: '◗',
  edit: '✏',
  trash: '⌫',
  grid: '⊞',
  image: '⊡',
  location: '◎',
  'person-add': '⊕',
  flag: '⚑',
  link: '⊕',
  at: '@',
  hash: '#',
  send: '➤',
  'dots-horizontal': '•••',
  smile: '◡',
};

function HeartIcon({color, size, filled}: {color: string; filled?: boolean; size: number}) {
  return (
    <Text
      style={{
        color: filled ? '#FF6584' : color,
        fontSize: size,
        lineHeight: size + 2,
      }}>
      {filled ? '♥' : '♡'}
    </Text>
  );
}

function BookmarkIcon({color, size, filled}: {color: string; filled?: boolean; size: number}) {
  return (
    <Text style={{color, fontSize: size * 0.9, lineHeight: size + 2}}>
      {filled ? '★' : '☆'}
    </Text>
  );
}

function CommentIcon({color, size}: {color: string; size: number}) {
  const sw = Math.max(1.5, size * 0.09);
  const bodyW = size * 0.88;
  const bodyH = size * 0.72;
  return (
    <View style={{height: size, width: size}}>
      <View
        style={{
          borderColor: color,
          borderRadius: 6,
          borderWidth: sw,
          height: bodyH,
          left: (size - bodyW) / 2,
          position: 'absolute',
          top: 0,
          width: bodyW,
        }}
      />
      <View
        style={{
          backgroundColor: 'transparent',
          borderLeftColor: color,
          borderLeftWidth: size * 0.14,
          borderRightColor: 'transparent',
          borderRightWidth: size * 0.08,
          borderStyle: 'solid',
          borderTopColor: color,
          borderTopWidth: size * 0.18,
          bottom: size * 0.04,
          left: size * 0.2,
          position: 'absolute',
        }}
      />
    </View>
  );
}

function ShareIcon({color, size}: {color: string; size: number}) {
  return (
    <Text style={{color, fontSize: size * 0.85, lineHeight: size + 2}}>
      {'↗'}
    </Text>
  );
}

export default function Icon({name, color = '#000', size = 24}: IconProps): React.JSX.Element {
  if (name === 'home' || name === 'home-filled') {
    return <HomeIcon color={color} size={size} />;
  }
  if (name === 'search') {
    return <SearchIcon color={color} size={size} />;
  }
  if (name === 'bell' || name === 'bell-filled') {
    return <BellIcon color={color} filled={name === 'bell-filled'} size={size} />;
  }
  if (name === 'user') {
    return <UserIcon color={color} size={size} />;
  }
  if (name === 'heart' || name === 'heart-filled') {
    return <HeartIcon color={color} filled={name === 'heart-filled'} size={size} />;
  }
  if (name === 'bookmark' || name === 'bookmark-filled') {
    return <BookmarkIcon color={color} filled={name === 'bookmark-filled'} size={size} />;
  }
  if (name === 'comment') {
    return <CommentIcon color={color} size={size} />;
  }
  if (name === 'share') {
    return <ShareIcon color={color} size={size} />;
  }

  const char = SIMPLE_CHARS[name] ?? '?';
  return (
    <Text
      style={{
        color,
        fontSize: name === 'dots-horizontal' ? size * 0.4 : size,
        lineHeight: size + 2,
        textAlign: 'center',
      }}>
      {char}
    </Text>
  );
}
