import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {useTheme} from '../theme/ThemeContext';

type ShimmerProps = {
  borderRadius?: number;
  height: number;
  width?: number | string;
};

function ShimmerLine({borderRadius = 8, height, width = '100%'}: ShimmerProps) {
  const {colors} = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          duration: 900,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.shimmer1, colors.shimmer2],
  });

  return (
    <Animated.View
      style={[{backgroundColor, borderRadius, height, width: width as any}]}
    />
  );
}

export function PostCardShimmer(): React.JSX.Element {
  const {colors} = useTheme();
  return (
    <View
      style={[
        styles.card,
        {backgroundColor: colors.card, borderColor: colors.border},
      ]}>
      <View style={styles.headerRow}>
        <ShimmerLine borderRadius={22} height={44} width={44} />
        <View style={styles.headerText}>
          <ShimmerLine height={14} width="55%" />
          <View style={styles.gap6} />
          <ShimmerLine height={11} width="30%" />
        </View>
      </View>
      <View style={styles.gap12} />
      <ShimmerLine height={14} />
      <View style={styles.gap6} />
      <ShimmerLine height={14} width="80%" />
      <View style={styles.gap12} />
      <ShimmerLine borderRadius={12} height={180} />
    </View>
  );
}

export function UserRowShimmer(): React.JSX.Element {
  const {colors} = useTheme();
  return (
    <View
      style={[
        styles.userRow,
        {backgroundColor: colors.card, borderColor: colors.border},
      ]}>
      <ShimmerLine borderRadius={22} height={44} width={44} />
      <View style={styles.userText}>
        <ShimmerLine height={14} width="45%" />
        <View style={styles.gap6} />
        <ShimmerLine height={11} width="30%" />
      </View>
    </View>
  );
}

export default ShimmerLine;

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 16,
  },
  gap12: {height: 12},
  gap6: {height: 6},
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  userRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 12,
  },
  userText: {
    flex: 1,
  },
});
