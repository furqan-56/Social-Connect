import React, {useRef} from 'react';
import {Animated, Image, StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

type AvatarProps = {
  name?: string;
  onlineIndicator?: boolean;
  size?: number;
  storyRing?: 'unseen' | 'seen' | 'none';
  uri?: string;
};

export default function Avatar({
  name,
  onlineIndicator = false,
  size = 44,
  storyRing = 'none',
  uri,
}: AvatarProps): React.JSX.Element {
  const {colors} = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const ringSize = size + 6;
  const ringBorderWidth = 2.5;

  const initials = name
    ? name
        .split(' ')
        .map(p => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  const ringColor =
    storyRing === 'unseen'
      ? colors.primary
      : storyRing === 'seen'
      ? colors.textMuted
      : 'transparent';

  return (
    <View style={{alignItems: 'center', height: ringSize, justifyContent: 'center', width: ringSize}}>
      {storyRing !== 'none' && (
        <View
          style={[
            styles.ring,
            {
              borderColor: ringColor,
              borderRadius: ringSize / 2,
              borderWidth: ringBorderWidth,
              height: ringSize,
              width: ringSize,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.avatar,
          {
            backgroundColor: colors.primary + '22',
            borderRadius: size / 2,
            height: size,
            width: size,
          },
        ]}>
        {uri ? (
          <Image
            source={{uri}}
            style={{borderRadius: size / 2, height: size, width: size}}
          />
        ) : (
          <Text
            style={[
              styles.initials,
              {color: colors.primary, fontSize: size * 0.36},
            ]}>
            {initials}
          </Text>
        )}
      </View>
      {onlineIndicator && (
        <View
          style={[
            styles.onlineDot,
            {
              backgroundColor: colors.success,
              bottom: ringSize * 0.05,
              height: size * 0.28,
              right: ringSize * 0.05,
              width: size * 0.28,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'absolute',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  onlineDot: {
    borderColor: '#fff',
    borderRadius: 99,
    borderWidth: 2,
    position: 'absolute',
  },
  ring: {
    position: 'absolute',
  },
});
