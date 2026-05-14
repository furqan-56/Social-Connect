import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../theme/ThemeContext';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

type FloatingDot = {
  color: string;
  delay: number;
  left: string;
  size: number;
  top: string;
};

function FloatingDots(): React.JSX.Element {
  const {colors} = useTheme();

  const dots: FloatingDot[] = [
    {color: colors.primary, delay: 0,    left: '15%', size: 10, top: '20%'},
    {color: colors.accent,  delay: 300,  left: '75%', size: 8,  top: '15%'},
    {color: colors.success, delay: 600,  left: '80%', size: 12, top: '55%'},
    {color: colors.warning, delay: 200,  left: '10%', size: 9,  top: '65%'},
    {color: colors.primary, delay: 500,  left: '45%', size: 7,  top: '10%'},
    {color: colors.accent,  delay: 100,  left: '50%', size: 11, top: '80%'},
  ];

  const anims = useRef(dots.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(dots[i].delay),
          Animated.timing(anim, {
            duration: 2000 + i * 200,
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            duration: 2000 + i * 200,
            toValue: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {dots.map((dot, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -14],
        });
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.4, 1, 0.4],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: dot.color,
                borderRadius: dot.size / 2,
                height: dot.size,
                left: dot.left as any,
                opacity,
                top: dot.top as any,
                transform: [{translateY}],
                width: dot.size,
              },
            ]}
          />
        );
      })}
    </>
  );
}

export default function WelcomeScreen({navigation}: Props): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {duration: 600, toValue: 1, useNativeDriver: true}),
      Animated.spring(slideAnim, {bounciness: 4, speed: 8, toValue: 0, useNativeDriver: true}),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const gradientColors: string[] = isDark
    ? ['#1A1228', '#0D0D14']
    : ['#E8E4FF', '#F0E4F8'];

  return (
    <View style={[styles.root, {backgroundColor: colors.bg}]}>
      <StatusBar
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
      />

      {/* Top 60% — gradient hero */}
      <View style={styles.heroWrap}>
        <LinearGradient
          colors={gradientColors}
          end={{x: 0.5, y: 1}}
          start={{x: 0.5, y: 0}}
          style={styles.heroGradient}>
          {/* Floating dots */}
          <FloatingDots />
          {/* SC Monogram */}
          <View style={[styles.monogram, {backgroundColor: colors.primary}]}>
            <Text style={styles.monogramText}>SC</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Bottom 40% */}
      <Animated.View
        style={[
          styles.bottom,
          {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
        ]}>
        <Text style={[styles.welcomeTo, {color: colors.textSecondary}]}>
          Welcome to
        </Text>
        <Text style={[styles.appName, {color: colors.textPrimary}]}>
          Social Connect
        </Text>
        <Text style={[styles.tagline, {color: colors.textSecondary}]}>
          Your space to share moments and connect with people that matter.
        </Text>

        <Pressable
          onPress={() => navigation.navigate('SignUp')}
          style={({pressed}) => [
            styles.primaryBtn,
            {backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1},
          ]}>
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={({pressed}) => [styles.ghostBtn, {opacity: pressed ? 0.65 : 1}]}>
          <Text style={[styles.ghostBtnText, {color: colors.primary}]}>
            I already have an account
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  appName: {
    fontSize: 28,
    fontWeight: '700',
  },
  bottom: {
    flex: 0.4,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  dot: {
    position: 'absolute',
  },
  ghostBtn: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  ghostBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  heroGradient: {
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroWrap: {
    flex: 0.6,
  },
  monogram: {
    alignItems: 'center',
    borderRadius: 24,
    height: 88,
    justifyContent: 'center',
    shadowOffset: {height: 8, width: 0},
    shadowOpacity: 0.3,
    shadowRadius: 24,
    width: 88,
  },
  monogramText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  primaryBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    marginTop: 32,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  root: {
    flex: 1,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  welcomeTo: {
    fontSize: 15,
  },
});
