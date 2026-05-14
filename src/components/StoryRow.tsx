import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Avatar from './Avatar';
import {useTheme} from '../theme/ThemeContext';
import {useAppSelector} from '../store/hooks';
import {hapticLight} from '../utils/haptics';

type StoryItem = {
  id: string;
  name: string;
  seen?: boolean;
  uri?: string;
};

const MOCK_STORIES: StoryItem[] = [
  {id: '2', name: 'Alex Morgan', seen: false},
  {id: '3', name: 'Jamie Chen', seen: false},
  {id: '4', name: 'Sofia Reyes', seen: true},
  {id: '5', name: 'Marcus Lee', seen: false},
  {id: '6', name: 'Priya Shah', seen: true},
  {id: '7', name: 'Noah Kim', seen: false},
];

// Gradient color stop pairs that cycle for unseen rings
const RING_GRADIENTS: [string, string][] = [
  ['#6C63FF', '#FF6584'],
  ['#FF6584', '#F59E0B'],
  ['#6C63FF', '#22C55E'],
  ['#F59E0B', '#FF6584'],
];

type StoryRingProps = {
  avatarSize: number;
  index: number;
  seen?: boolean;
};

function AnimatedStoryRing({avatarSize, index, seen}: StoryRingProps): React.JSX.Element {
  const {colors} = useTheme();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!seen) {
      const loop = Animated.loop(
        Animated.timing(rotation, {
          duration: 3000,
          toValue: 1,
          useNativeDriver: true,
        }),
      );
      loop.start();
      return () => loop.stop();
    }
    return () => undefined;
  }, [seen, rotation]);

  const ringSize = avatarSize + 8;
  const gradPair = RING_GRADIENTS[index % RING_GRADIENTS.length];

  if (seen) {
    return (
      <View
        style={[
          styles.seenRing,
          {
            borderColor: colors.textMuted + '60',
            borderRadius: ringSize / 2,
            height: ringSize,
            width: ringSize,
          },
        ]}
      />
    );
  }

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.gradientRingWrap,
        {
          borderRadius: ringSize / 2,
          height: ringSize,
          transform: [{rotate: spin}],
          width: ringSize,
        },
      ]}>
      <LinearGradient
        colors={[gradPair[0], gradPair[1], gradPair[0]]}
        end={{x: 1, y: 1}}
        start={{x: 0, y: 0}}
        style={[styles.gradientRing, {borderRadius: ringSize / 2}]}
      />
    </Animated.View>
  );
}

type StoryBubbleProps = {
  avatarSize?: number;
  index: number;
  item: StoryItem;
};

function StoryBubble({avatarSize = 58, index, item}: StoryBubbleProps): React.JSX.Element {
  const {colors} = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    hapticLight();
    Animated.sequence([
      Animated.spring(scale, {bounciness: 12, speed: 30, toValue: 0.9, useNativeDriver: true}),
      Animated.spring(scale, {bounciness: 10, speed: 18, toValue: 1,   useNativeDriver: true}),
    ]).start();
  };

  const ringSize = avatarSize + 8;

  return (
    <Pressable onPress={handlePress} style={styles.storyItem}>
      <Animated.View style={{transform: [{scale}]}}>
        <View style={[styles.ringContainer, {height: ringSize, width: ringSize}]}>
          <AnimatedStoryRing avatarSize={avatarSize} index={index} seen={item.seen} />
          {/* Inner white border to separate avatar from ring */}
          <View
            style={[
              styles.innerBorder,
              {
                backgroundColor: colors.card,
                borderRadius: (avatarSize + 4) / 2,
                height: avatarSize + 4,
                width: avatarSize + 4,
              },
            ]}>
            <Avatar name={item.name} size={avatarSize} uri={item.uri} storyRing="none" />
          </View>
        </View>
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[
          styles.storyName,
          {color: item.seen ? colors.textMuted : colors.textSecondary},
        ]}>
        {item.name.split(' ')[0]}
      </Text>
    </Pressable>
  );
}

export default function StoryRow(): React.JSX.Element {
  const {colors} = useTheme();
  const user = useAppSelector(state => state.auth.user);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scroll, {backgroundColor: colors.card, borderBottomColor: colors.border}]}>
      {/* Own story bubble */}
      <Pressable
        onPress={() => hapticLight()}
        style={styles.storyItem}>
        <View style={styles.ownStoryWrap}>
          <Avatar
            name={user?.name ?? 'You'}
            size={58}
            storyRing="none"
            uri={user?.photoUri}
          />
          <View
            style={[
              styles.addBadge,
              {backgroundColor: colors.primary, borderColor: colors.card},
            ]}>
            <Text style={styles.addBadgeText}>+</Text>
          </View>
        </View>
        <Text numberOfLines={1} style={[styles.storyName, {color: colors.textSecondary}]}>
          Your Story
        </Text>
      </Pressable>

      {MOCK_STORIES.map((story, i) => (
        <StoryBubble key={story.id} avatarSize={58} index={i} item={story} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addBadge: {
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 2,
    bottom: 0,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 20,
  },
  addBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: -1,
  },
  container: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  gradientRing: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  gradientRingWrap: {
    overflow: 'hidden',
    position: 'absolute',
  },
  innerBorder: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  ownStoryWrap: {
    position: 'relative',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  scroll: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  seenRing: {
    borderWidth: 2,
    position: 'absolute',
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 74,
  },
  storyName: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    width: 74,
  },
});
