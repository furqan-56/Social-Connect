import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useState} from 'react';
import AppIcon from '../components/AppIcon';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import {auth} from '../config/firebase';
import {useAppSelector} from '../store/hooks';
import {useTheme} from '../theme/ThemeContext';
import {hapticLight, hapticHeavy} from '../utils/haptics';
import type {RootStackParamList} from '../types/navigation';

type SectionItem = {
  icon: string;
  label: string;
  onPress?: () => void;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  danger?: boolean;
  chevron?: boolean;
};

type Section = {
  title: string;
  items: SectionItem[];
};

export default function SettingsScreen(): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAppSelector(state => state.auth.user);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {style: 'cancel', text: 'Cancel'},
      {
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await auth().signOut();
          } catch {
            setIsLoggingOut(false);
          }
        },
        style: 'destructive',
        text: 'Sign Out',
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action is permanent and cannot be undone.',
      [
        {style: 'cancel', text: 'Cancel'},
        {style: 'destructive', text: 'Delete Account', onPress: () => undefined},
      ],
    );
  };

  const sections: Section[] = [
    {
      items: [
        {chevron: true, icon: '◉', label: 'Edit Profile', onPress: () => navigation.navigate('EditProfile')},
        {chevron: true, icon: '⚿', label: 'Change Password', onPress: () => undefined},
        {chevron: true, icon: '⊕', label: 'Linked Accounts', onPress: () => undefined},
      ],
      title: 'Account',
    },
    {
      items: [
        {icon: '⚿', label: 'Private Account', toggle: true, toggleValue: privateAccount, onToggle: setPrivateAccount},
        {chevron: true, icon: '⊘', label: 'Blocked Users', onPress: () => undefined},
        {chevron: true, icon: '◎', label: 'Muted Accounts', onPress: () => undefined},
      ],
      title: 'Privacy',
    },
    {
      items: [
        {icon: '🔔', label: 'Push Notifications', toggle: true, toggleValue: pushEnabled, onToggle: setPushEnabled},
        {icon: '✉', label: 'Email Notifications', toggle: true, toggleValue: emailEnabled, onToggle: setEmailEnabled},
        {chevron: true, icon: '⚙', label: 'Notification Preferences', onPress: () => undefined},
      ],
      title: 'Notifications',
    },
    {
      items: [
        {icon: isDark ? '◗' : '☀', label: 'Dark Mode', toggle: true, toggleValue: isDark, onToggle: () => undefined},
        {chevron: true, icon: '⊞', label: 'App Icon', onPress: () => undefined},
      ],
      title: 'Appearance',
    },
    {
      items: [
        {chevron: true, icon: '◉', label: 'Help Center', onPress: () => undefined},
        {chevron: true, icon: '⚑', label: 'Report a Problem', onPress: () => undefined},
        {chevron: true, icon: '⊡', label: 'Terms of Service', onPress: () => undefined},
        {chevron: true, icon: '⚿', label: 'Privacy Policy', onPress: () => undefined},
      ],
      title: 'Support',
    },
  ];

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
      />
      <SafeAreaView edges={['top']}>
        <View style={[styles.header, {borderBottomColor: colors.border}]}>
          <Pressable
            hitSlop={12}
            onPress={() => navigation.canGoBack() && navigation.goBack()}>
            <Text style={[styles.backArrow, {color: colors.primary}]}>{'←'}</Text>
          </Pressable>
          <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>Settings</Text>
          <View style={styles.headerRight} />
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <Pressable
          onPress={() => navigation.navigate('EditProfile')}
          style={[styles.profileCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Avatar name={user?.name} size={52} uri={user?.photoUri} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, {color: colors.textPrimary}]}>
              {user?.name ?? 'Social Member'}
            </Text>
            <Text style={[styles.profileHandle, {color: colors.textMuted}]}>
              {'@' + (user?.name ?? 'user').toLowerCase().replace(/\s+/g, '_')}
            </Text>
          </View>
          <Text style={[styles.chevron, {color: colors.textMuted}]}>›</Text>
        </Pressable>

        {/* Setting sections */}
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, {color: colors.textMuted}]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              {section.items.map((item, idx) => (
                <Pressable
                  key={item.label}
                  onPress={item.toggle ? undefined : item.onPress}
                  style={({pressed}) => [
                    styles.row,
                    {
                      backgroundColor: pressed && !item.toggle ? colors.surface : 'transparent',
                      borderBottomColor: colors.divider,
                      borderBottomWidth: idx < section.items.length - 1 ? StyleSheet.hairlineWidth : 0,
                    },
                  ]}>
                  <Text style={[styles.rowIcon, {color: item.danger ? colors.error : colors.textSecondary}]}>
                    {item.icon}
                  </Text>
                  <Text style={[styles.rowLabel, {color: item.danger ? colors.error : colors.textPrimary}]}>
                    {item.label}
                  </Text>
                  {item.toggle ? (
                    <Switch
                      onValueChange={item.onToggle}
                      thumbColor={item.toggleValue ? '#fff' : colors.textMuted}
                      trackColor={{false: colors.surface, true: colors.primary}}
                      value={item.toggleValue}
                    />
                  ) : item.chevron ? (
                    <Text style={[styles.chevron, {color: colors.textMuted}]}>›</Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: colors.textMuted}]}>Account Actions</Text>
          <View style={[styles.sectionCard, {backgroundColor: colors.error + '08', borderColor: colors.error + '30'}]}>
            <Pressable
              disabled={isLoggingOut}
              onPress={handleLogout}
              style={({pressed}) => [
                styles.row,
                {
                  backgroundColor: pressed ? colors.error + '12' : 'transparent',
                  borderBottomColor: colors.error + '20',
                  borderBottomWidth: StyleSheet.hairlineWidth,
                },
              ]}>
              <Text style={[styles.rowIcon, {color: colors.error}]}>↩</Text>
              {isLoggingOut ? (
                <ActivityIndicator color={colors.error} />
              ) : (
                <Text style={[styles.rowLabel, {color: colors.error}]}>Sign Out</Text>
              )}
            </Pressable>
            <Pressable
              onPress={handleDeleteAccount}
              style={({pressed}) => [
                styles.row,
                {backgroundColor: pressed ? colors.error + '12' : 'transparent'},
              ]}>
              <Text style={[styles.rowIcon, {color: colors.error}]}>⌫</Text>
              <Text style={[styles.rowLabel, {color: colors.error}]}>Delete Account</Text>
            </Pressable>
          </View>
        </View>

        <Text style={[styles.version, {color: colors.textMuted}]}>
          Social Connect v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backArrow: {fontSize: 22},
  chevron: {fontSize: 20, fontWeight: '300'},
  container: {flex: 1},
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRight: {width: 30},
  headerTitle: {fontSize: 17, fontWeight: '600'},
  profileCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 14,
  },
  profileHandle: {fontSize: 13, marginTop: 2},
  profileInfo: {flex: 1},
  profileName: {fontSize: 16, fontWeight: '600'},
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {fontSize: 18, width: 22},
  rowLabel: {flex: 1, fontSize: 15},
  scroll: {paddingBottom: 60},
  section: {marginBottom: 8, marginHorizontal: 20},
  sectionCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  version: {fontSize: 12, marginBottom: 32, marginTop: 16, textAlign: 'center'},
});
