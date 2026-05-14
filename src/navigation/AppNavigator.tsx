import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {enableScreens} from 'react-native-screens';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import CustomTabBar from '../components/CustomTabBar';
import CommentScreen from '../screens/CommentScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import {auth} from '../config/firebase';
import {profileService} from '../services/profile';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {loginSucceeded, logout} from '../store/slices/authSlice';
import {useNotifications} from '../hooks/useNotifications';
import {useRealtimeSync} from '../hooks/useRealtimeSync';
import type {MainTabParamList, RootStackParamList} from '../types/navigation';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<MainTabParamList>();

// ─── Main Tabs ────────────────────────────────────────────────────────────────

function MainTabs(): React.JSX.Element {
  useRealtimeSync();
  useNotifications();

  return (
    <Tab.Navigator
      screenOptions={{headerShown: false}}
      tabBar={props => <CustomTabBar {...props} />}>
      <Tab.Screen component={HomeScreen}          name="Home" />
      <Tab.Screen component={DiscoverScreen}      name="Discover" />
      {/* Create tab — press is intercepted in CustomTabBar to open CreatePost modal */}
      <Tab.Screen component={View}                name="Create" />
      <Tab.Screen component={NotificationsScreen} name="Notifications" />
      <Tab.Screen component={ProfileScreen}       name="Profile" />
    </Tab.Navigator>
  );
}

// ─── App Navigator ────────────────────────────────────────────────────────────

export default function AppNavigator(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [splashDone, setSplashDone]       = useState(false);

  // Enforce minimum 2 s splash
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2000);
    return () => clearTimeout(t);
  }, []);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        try {
          const profile = await profileService.getProfile();
          dispatch(loginSucceeded(profile));
        } catch {
          dispatch(
            loginSucceeded({
              bio: '',
              id: user.uid,
              name: user.displayName ?? 'Social Member',
              updatedAt: new Date().toISOString(),
            }),
          );
        }
      } else {
        dispatch(logout());
      }
      setIsAuthLoading(false);
    });
    return unsubscribe;
  }, [dispatch]);

  if (!splashDone || isAuthLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{animation: 'slide_from_right', headerShown: false}}>
        {isAuthenticated ? (
          <>
            <Stack.Screen component={MainTabs}         name="MainTabs" />
            <Stack.Screen component={UserProfileScreen} name="UserProfile" />
            <Stack.Screen
              component={CommentScreen}
              name="Comments"
              options={{animation: 'slide_from_bottom', presentation: 'modal'}}
            />
            <Stack.Screen
              component={CreatePostScreen}
              name="CreatePost"
              options={{animation: 'slide_from_bottom', presentation: 'modal'}}
            />
            <Stack.Screen component={EditProfileScreen} name="EditProfile" />
            <Stack.Screen component={SettingsScreen}    name="Settings" />
          </>
        ) : (
          <>
            <Stack.Screen component={WelcomeScreen}         name="Welcome" />
            <Stack.Screen component={LoginScreen}           name="Login" />
            <Stack.Screen component={SignUpScreen}          name="SignUp" />
            <Stack.Screen component={ForgotPasswordScreen}  name="ForgotPassword" />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
