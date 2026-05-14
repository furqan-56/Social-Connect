import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppIcon from './AppIcon';
import {useTheme} from '../theme/ThemeContext';
import {hapticLight, hapticMedium} from '../utils/haptics';
import type {AppIconName} from './Icons';
import type {MainTabParamList} from '../types/navigation';

const TAB_HEIGHT = 64;
const FAB_SIZE = 56;
const FAB_RISE = 18; // px above the pill top edge

type TabConfig = {
  icon: AppIconName;
  label: string;
};

const TAB_CONFIG: Record<keyof MainTabParamList, TabConfig> = {
  Home:          {icon: 'home',     label: 'Home'},
  Discover:      {icon: 'discover', label: 'Discover'},
  Create:        {icon: 'create',   label: 'New'},
  Notifications: {icon: 'bell',     label: 'Activity'},
  Profile:       {icon: 'person',   label: 'Me'},
};

// ─── Single tab item ──────────────────────────────────────────────────────────

type TabItemProps = {
  isFocused: boolean;
  label: string;
  name: keyof MainTabParamList;
  onPress: () => void;
  showBadge?: boolean;
};

function TabItem({
  isFocused,
  label,
  name,
  onPress,
  showBadge = false,
}: TabItemProps): React.JSX.Element {
  const {colors} = useTheme();
  const iconScale = useRef(new Animated.Value(1)).current;
  const labelOpacity = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const labelHeight = useRef(new Animated.Value(isFocused ? 14 : 0)).current;

  useEffect(() => {
    if (isFocused) {
      Animated.parallel([
        Animated.sequence([
          Animated.spring(iconScale, {bounciness: 16, speed: 32, toValue: 1.2, useNativeDriver: true}),
          Animated.spring(iconScale, {bounciness: 4,  speed: 20, toValue: 1,   useNativeDriver: true}),
        ]),
        Animated.timing(labelOpacity, {duration: 180, toValue: 1, useNativeDriver: true}),
        Animated.timing(labelHeight, {duration: 180, toValue: 14, useNativeDriver: false}),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(labelOpacity, {duration: 120, toValue: 0, useNativeDriver: true}),
        Animated.timing(labelHeight, {duration: 120, toValue: 0, useNativeDriver: false}),
      ]).start();
    }
  }, [isFocused, iconScale, labelHeight, labelOpacity]);

  const color = isFocused ? colors.primary : colors.textMuted;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={isFocused ? {selected: true} : {}}
      onPress={onPress}
      style={styles.tabItem}>
      <View style={styles.iconWrap}>
        <Animated.View style={{transform: [{scale: iconScale}]}}>
          <AppIcon active={isFocused} color={color} name={TAB_CONFIG[name].icon} size="nav" />
        </Animated.View>
        {showBadge && (
          <View style={[styles.badge, {backgroundColor: colors.accent}]} />
        )}
      </View>
      <Animated.View style={{height: labelHeight, overflow: 'hidden'}}>
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            {color, fontWeight: isFocused ? '600' : '400', opacity: labelOpacity},
          ]}>
          {label}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── FAB (center Create button) ───────────────────────────────────────────────

type FabProps = {
  onPress: () => void;
};

function FabButton({onPress}: FabProps): React.JSX.Element {
  const {colors} = useTheme();
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    hapticMedium();
    Animated.parallel([
      Animated.sequence([
        Animated.timing(rotation, {duration: 200, toValue: 1, useNativeDriver: true}),
        Animated.timing(rotation, {duration: 0,   toValue: 0, useNativeDriver: true}),
      ]),
      Animated.sequence([
        Animated.spring(scale, {bounciness: 12, speed: 28, toValue: 0.86, useNativeDriver: true}),
        Animated.spring(scale, {bounciness: 14, speed: 18, toValue: 1,    useNativeDriver: true}),
      ]),
    ]).start();
    onPress();
  }, [onPress, rotation, scale]);

  const rotate = rotation.interpolate({inputRange: [0, 1], outputRange: ['0deg', '135deg']});

  return (
    <Animated.View
      style={[
        styles.fabShadow,
        {shadowColor: colors.primary, transform: [{scale}]},
      ]}>
      <Pressable
        onPress={handlePress}
        style={[styles.fab, {backgroundColor: colors.primary}]}>
        <Animated.View style={{transform: [{rotate}]}}>
          <AppIcon active color="#fff" name="create" size={26} />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main CustomTabBar ────────────────────────────────────────────────────────

export default function CustomTabBar({
  descriptors,
  navigation,
  state,
}: BottomTabBarProps): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const insets = useSafeAreaInsets();

  const glassBg = isDark
    ? 'rgba(20, 20, 30, 0.94)'
    : 'rgba(255, 255, 255, 0.94)';
  const glassBorder = isDark
    ? 'rgba(108, 99, 255, 0.28)'
    : 'rgba(255, 255, 255, 0.80)';

  const bottomOffset = insets.bottom + 4;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrapper, {bottom: bottomOffset}]}>
      {/* FAB sits above the pill */}
      <View style={styles.fabContainer} pointerEvents="box-none">
        <FabButton
          onPress={() => {
            (navigation as any).getParent()?.navigate('CreatePost');
          }}
        />
      </View>

      {/* Pill bar */}
      <View
        style={[
          styles.pill,
          {
            backgroundColor: glassBg,
            borderColor: glassBorder,
            shadowColor: colors.primary,
          },
        ]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isCreate = route.name === 'Create';
          const config = TAB_CONFIG[route.name as keyof MainTabParamList];

          if (isCreate) {
            // Spacer slot — FAB sits above this gap
            return <View key={route.key} style={styles.fabSlot} />;
          }

          const onPress = () => {
            hapticLight();
            const event = navigation.emit({
              canPreventDefault: true,
              target: route.key,
              type: 'tabPress',
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              isFocused={isFocused}
              label={config.label}
              name={route.name as keyof MainTabParamList}
              onPress={onPress}
              showBadge={route.name === 'Notifications' && !isFocused}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderColor: '#fff',
    borderRadius: 9999,
    borderWidth: 1.5,
    height: 8,
    position: 'absolute',
    right: -2,
    top: -1,
    width: 8,
  },
  fab: {
    alignItems: 'center',
    borderRadius: FAB_SIZE / 2,
    elevation: 0,
    height: FAB_SIZE,
    justifyContent: 'center',
    width: FAB_SIZE,
  },
  fabContainer: {
    alignItems: 'center',
    bottom: TAB_HEIGHT - FAB_SIZE / 2 + FAB_RISE,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 10,
  },
  fabShadow: {
    borderRadius: FAB_SIZE / 2,
    elevation: 12,
    shadowOffset: {height: 8, width: 0},
    shadowOpacity: 0.36,
    shadowRadius: 16,
  },
  fabSlot: {
    flex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pill: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    elevation: 16,
    flexDirection: 'row',
    height: TAB_HEIGHT,
    shadowOffset: {height: 8, width: 0},
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 4,
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'center',
  },
  wrapper: {
    left: 20,
    position: 'absolute',
    right: 20,
    zIndex: 99,
  },
});
