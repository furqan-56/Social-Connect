import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../theme/ThemeContext';

type AppHeaderProps = {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  title?: string;
  transparent?: boolean;
};

export default function AppHeader({
  leftAction,
  rightAction,
  title,
  transparent = false,
}: AppHeaderProps): React.JSX.Element {
  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: transparent ? 'transparent' : colors.card,
          borderBottomColor: colors.border,
          paddingTop: insets.top + 8,
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.side}>{leftAction ?? <View />}</View>
        {title ? (
          <Text style={[styles.title, {color: colors.textPrimary}]}>{title}</Text>
        ) : (
          <View style={styles.titlePlaceholder} />
        )}
        <View style={[styles.side, styles.rightSide]}>{rightAction ?? <View />}</View>
      </View>
    </View>
  );
}

export function HeaderBackButton({
  onPress,
  label = 'Back',
}: {
  label?: string;
  onPress: () => void;
}): React.JSX.Element {
  const {colors} = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      style={styles.backButton}>
      <Text style={[styles.backArrow, {color: colors.primary}]}>{'←'}</Text>
      <Text style={[styles.backLabel, {color: colors.primary}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backArrow: {
    fontSize: 20,
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
  },
  backLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  rightSide: {
    justifyContent: 'flex-end',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  side: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  titlePlaceholder: {
    flex: 1,
  },
});
