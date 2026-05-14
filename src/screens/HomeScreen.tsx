import {useNavigation} from '@react-navigation/native';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import PostFeed from '../components/PostFeed';
import {useTheme} from '../theme/ThemeContext';
import {hapticLight} from '../utils/haptics';
import type {MainTabParamList, RootStackParamList} from '../types/navigation';

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function HomeScreen(): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<HomeNavProp>();

  return (
    <View style={[styles.container, {backgroundColor: colors.bg}]}>
      <StatusBar
        backgroundColor={colors.surface}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />

      {/* App bar */}
      <SafeAreaView
        edges={['top']}
        style={[
          styles.appBar,
          {backgroundColor: colors.surface, borderBottomColor: colors.border},
        ]}>
        <View style={styles.appBarContent}>
          {/* SC monogram — rounded pill */}
          <View style={[styles.monogram, {backgroundColor: colors.primary}]}>
            <Text style={styles.monogramText}>SC</Text>
          </View>

          {/* Right icon buttons */}
          <View style={styles.appBarRight}>
            {/* Bell with red dot badge */}
            <Pressable
              onPress={() => {
                hapticLight();
                navigation.navigate('Notifications');
              }}
              style={({pressed}) => [styles.iconBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Feather color={colors.textPrimary} name="bell" size={22} />
              <View
                style={[
                  styles.notifBadge,
                  {backgroundColor: colors.error, borderColor: colors.surface},
                ]}
              />
            </Pressable>

            {/* Message icon */}
            <Pressable
              onPress={() => hapticLight()}
              style={({pressed}) => [styles.iconBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Feather color={colors.textPrimary} name="message-circle" size={22} />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>

      <PostFeed navigation={navigation as any} />
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    borderBottomWidth: 0.5,
  },
  appBarContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  appBarRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  container: {
    flex: 1,
  },
  iconBtn: {
    padding: 8,
    position: 'relative',
  },
  monogram: {
    alignItems: 'center',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: 50,
  },
  monogramText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  notifBadge: {
    borderRadius: 9999,
    borderWidth: 1.5,
    height: 8,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 8,
  },
});
