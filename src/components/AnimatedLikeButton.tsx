import React, {useEffect, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import AppIcon from './AppIcon';
import {useTheme} from '../theme/ThemeContext';
import {hapticMedium} from '../utils/haptics';

type AnimatedLikeButtonProps = {
  likedByMe: boolean;
  likeCount: number;
  onPress: () => void;
};

// Eight particles at 45° intervals
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];
const BURST_RADIUS = 22;

type ParticleAnim = {
  opacity: Animated.Value;
  scale: Animated.Value;
  x: Animated.Value;
  y: Animated.Value;
};

function createParticle(): ParticleAnim {
  return {
    opacity: new Animated.Value(0),
    scale:   new Animated.Value(0),
    x:       new Animated.Value(0),
    y:       new Animated.Value(0),
  };
}

function burstParticle(p: ParticleAnim, angleDeg: number): Animated.CompositeAnimation {
  const rad = (angleDeg * Math.PI) / 180;
  const tx = Math.cos(rad) * BURST_RADIUS;
  const ty = Math.sin(rad) * BURST_RADIUS;

  return Animated.parallel([
    Animated.sequence([
      Animated.timing(p.opacity, {duration: 80,  toValue: 1,  useNativeDriver: true}),
      Animated.timing(p.opacity, {duration: 260, toValue: 0,  useNativeDriver: true}),
    ]),
    Animated.sequence([
      Animated.spring(p.scale, {bounciness: 8, speed: 40, toValue: 1, useNativeDriver: true}),
      Animated.timing(p.scale, {duration: 180, toValue: 0, useNativeDriver: true}),
    ]),
    Animated.timing(p.x, {duration: 340, toValue: tx, useNativeDriver: true}),
    Animated.timing(p.y, {duration: 340, toValue: ty, useNativeDriver: true}),
  ]);
}

function resetParticle(p: ParticleAnim): void {
  p.opacity.setValue(0);
  p.scale.setValue(0);
  p.x.setValue(0);
  p.y.setValue(0);
}

export default React.memo(function AnimatedLikeButton({
  likedByMe,
  likeCount,
  onPress,
}: AnimatedLikeButtonProps): React.JSX.Element {
  const {colors} = useTheme();

  // Heart scale
  const heartScale = useRef(new Animated.Value(1)).current;

  // Color interpolation value (0 = unliked, 1 = liked)
  const colorAnim = useRef(new Animated.Value(likedByMe ? 1 : 0)).current;

  // Particles
  const particles = useRef(PARTICLE_ANGLES.map(() => createParticle())).current;

  const wasLiked = useRef(likedByMe);

  useEffect(() => {
    const justLiked = likedByMe && !wasLiked.current;
    const justUnliked = !likedByMe && wasLiked.current;

    if (justLiked) {
      hapticMedium();

      // Reset particle positions
      particles.forEach(resetParticle);

      Animated.parallel([
        // Heart pop
        Animated.sequence([
          Animated.spring(heartScale, {bounciness: 20, speed: 42, toValue: 1.5, useNativeDriver: true}),
          Animated.spring(heartScale, {bounciness: 6,  speed: 20, toValue: 1,   useNativeDriver: true}),
        ]),
        // Color fill
        Animated.timing(colorAnim, {duration: 220, toValue: 1, useNativeDriver: false}),
        // Burst
        ...particles.map((p, i) => burstParticle(p, PARTICLE_ANGLES[i])),
      ]).start();
    } else if (justUnliked) {
      Animated.parallel([
        Animated.spring(heartScale, {bounciness: 8, speed: 24, toValue: 0.85, useNativeDriver: true}),
        Animated.timing(colorAnim, {duration: 160, toValue: 0, useNativeDriver: false}),
      ]).start(() => {
        Animated.spring(heartScale, {bounciness: 4, speed: 14, toValue: 1, useNativeDriver: true}).start();
      });
    }

    wasLiked.current = likedByMe;
  }, [likedByMe, heartScale, colorAnim, particles]);

  const iconColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.accent],
  });

  const bgColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', colors.accent + '18'],
  });

  const countColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textSecondary, colors.accent],
  });

  return (
    <Pressable
      accessibilityLabel={`${likeCount} likes`}
      accessibilityRole="button"
      onPress={onPress}
      style={({pressed}) => [{opacity: pressed ? 0.75 : 1}]}>
      <Animated.View style={[styles.button, {backgroundColor: bgColor}]}>
        {/* Particle layer */}
        <View style={styles.particleContainer} pointerEvents="none">
          {particles.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: i % 2 === 0 ? colors.accent : colors.primary,
                  opacity: p.opacity,
                  transform: [{translateX: p.x}, {translateY: p.y}, {scale: p.scale}],
                },
              ]}
            />
          ))}
        </View>

        {/* Heart icon */}
        <Animated.View style={{transform: [{scale: heartScale}]}}>
          <Animated.Text style={[styles.heartChar, {color: iconColor as any}]}>
            {likedByMe ? '♥' : '♡'}
          </Animated.Text>
        </Animated.View>

        {/* Count */}
        <Animated.Text style={[styles.count, {color: countColor as any}]}>
          {likeCount}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: 'relative',
  },
  count: {
    fontSize: 13,
    fontWeight: '500',
  },
  heartChar: {
    fontSize: 18,
    lineHeight: 20,
  },
  particle: {
    borderRadius: 9999,
    height: 5,
    position: 'absolute',
    width: 5,
  },
  particleContainer: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
