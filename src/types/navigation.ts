import type {NavigatorScreenParams} from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Create: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: {notice?: string} | undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Comments: {postId: string};
  UserProfile: {userId: string};
  CreatePost: undefined;
  EditProfile: undefined;
  Settings: undefined;
};
