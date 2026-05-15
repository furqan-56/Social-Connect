import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Formik} from 'formik';
import React, {useRef, useState} from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import * as Yup from 'yup';
import {socialAuth} from '../services/auth';
import {useTheme} from '../theme/ThemeContext';
import type {RootStackParamList} from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const loginSchema = Yup.object({
  email:    Yup.string().trim().email('Enter a valid email.').required('Email is required.'),
  password: Yup.string().min(6, 'Min 6 characters.').required('Password is required.'),
});

// ─── FloatingInput ────────────────────────────────────────────────────────────

type FloatingInputProps = {
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  keyboardType?: 'default' | 'email-address';
  label: string;
  leftIcon: string;
  onBlur?: () => void;
  onChangeText: (text: string) => void;
  rightIcon?: boolean;
  secureTextEntry?: boolean;
  touched?: boolean;
  value: string;
};

function FloatingInput({
  autoCapitalize = 'none',
  error,
  keyboardType = 'default',
  label,
  leftIcon,
  onBlur,
  onChangeText,
  secureTextEntry = false,
  touched,
  value,
}: FloatingInputProps): React.JSX.Element {
  const {colors} = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const animVal = useRef(new Animated.Value(value ? 1 : 0)).current;

  const isPassword = secureTextEntry;
  const hasError = touched && error;
  const isFloated = focused || value.length > 0;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(animVal, {
      duration: 150,
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(animVal, {
        duration: 150,
        toValue: 0,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.();
  };

  const labelFontSize = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 11],
  });
  const labelTranslateY = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  const labelColor = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textMuted, colors.primary],
  });

  return (
    <View style={styles.fiContainer}>
      <View
        style={[
          styles.fiBox,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: hasError
              ? colors.error
              : focused
              ? colors.primary
              : colors.border,
          },
        ]}>
        <Feather
          color={focused ? colors.primary : colors.textSecondary}
          name={leftIcon}
          size={18}
          style={styles.fiLeftIcon}
        />
        <View style={styles.fiInputWrap}>
          <Animated.Text
            style={[
              styles.fiLabel,
              {
                color: hasError ? colors.error : labelColor,
                fontSize: labelFontSize,
                transform: [{translateY: labelTranslateY}],
              },
            ]}>
            {label}
          </Animated.Text>
          <TextInput
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            onBlur={handleBlur}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isPassword && !showPass}
            style={[
              styles.fiTextInput,
              {
                color: colors.textPrimary,
                paddingTop: isFloated ? 14 : 0,
              },
            ]}
            value={value}
          />
        </View>
        {isPassword && (
          <Pressable hitSlop={8} onPress={() => setShowPass(s => !s)}>
            <Feather
              color={colors.textSecondary}
              name={showPass ? 'eye-off' : 'eye'}
              size={18}
            />
          </Pressable>
        )}
      </View>
      {hasError ? (
        <View style={styles.fiErrorRow}>
          <Feather color={colors.error} name="alert-circle" size={13} />
          <Text style={[styles.fiErrorText, {color: colors.error}]}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── LoginScreen ──────────────────────────────────────────────────────────────

export default function LoginScreen({navigation, route}: Props): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const [formError, setFormError] = useState('');
  const notice = route.params?.notice;

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: colors.bg}]}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Back arrow */}
          <Pressable
            hitSlop={8}
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome')}
            style={styles.backBtn}>
            <Feather color={colors.textPrimary} name="arrow-left" size={22} />
          </Pressable>

          {/* Hero card */}
          <View style={styles.heroWrap}>
            <View style={[styles.heroCircle, {backgroundColor: 'rgba(108,99,255,0.15)'}]}>
              <Feather color={colors.primary} name="lock" size={32} />
            </View>
            <Text style={[styles.heroTitle, {color: colors.textPrimary}]}>
              Welcome back!
            </Text>
            <Text style={[styles.heroSubtitle, {color: colors.textSecondary}]}>
              Sign in to continue
            </Text>
          </View>

          {/* Notice banner */}
          {notice ? (
            <View
              style={[
                styles.noticeBanner,
                {backgroundColor: colors.success + '18', borderColor: colors.success + '40'},
              ]}>
              <Text style={[styles.noticeText, {color: colors.success}]}>{notice}</Text>
            </View>
          ) : null}

          {/* Form error banner */}
          {formError ? (
            <View
              style={[
                styles.errorBanner,
                {backgroundColor: colors.error + '15', borderColor: colors.error + '30'},
              ]}>
              <Text style={[styles.errorBannerText, {color: colors.error}]}>{formError}</Text>
            </View>
          ) : null}

          <Formik
            initialValues={{email: '', password: ''}}
            onSubmit={async (values, {setSubmitting}) => {
              try {
                setFormError('');
                await socialAuth.login(values);
              } catch (err) {
                setFormError(err instanceof Error ? err.message : 'Unable to log in.');
              } finally {
                setSubmitting(false);
              }
            }}
            validationSchema={loginSchema}>
            {({errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values}) => (
              <>
                {/* EMAIL */}
                <Text style={[styles.sectionLabel, {color: colors.textSecondary}]}>EMAIL</Text>
                <FloatingInput
                  autoCapitalize="none"
                  error={errors.email}
                  keyboardType="email-address"
                  label="Email address"
                  leftIcon="mail"
                  onBlur={() => handleBlur({target: {name: 'email'}} as any)}
                  onChangeText={handleChange('email')}
                  touched={touched.email}
                  value={values.email}
                />

                {/* PASSWORD */}
                <Text style={[styles.sectionLabel, {color: colors.textSecondary}]}>PASSWORD</Text>
                <FloatingInput
                  error={errors.password}
                  label="Password"
                  leftIcon="lock"
                  onBlur={() => handleBlur({target: {name: 'password'}} as any)}
                  onChangeText={handleChange('password')}
                  secureTextEntry
                  touched={touched.password}
                  value={values.password}
                />

                {/* Forgot password */}
                <Pressable
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotWrap}>
                  <Text style={[styles.forgotText, {color: colors.primary}]}>
                    Forgot password?
                  </Text>
                </Pressable>

                {/* Sign In button */}
                <Pressable
                  disabled={isSubmitting}
                  onPress={() => handleSubmit()}
                  style={({pressed}) => [
                    styles.signInBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed || isSubmitting ? 0.8 : 1,
                    },
                  ]}>
                  <Text style={styles.signInBtnText}>
                    {isSubmitting ? 'Signing in…' : 'Sign In'}
                  </Text>
                </Pressable>
              </>
            )}
          </Formik>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, {backgroundColor: colors.border}]} />
            <Text style={[styles.dividerText, {color: colors.textMuted}]}>
              or continue with
            </Text>
            <View style={[styles.dividerLine, {backgroundColor: colors.border}]} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <Pressable
              style={({pressed}) => [
                styles.socialBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Feather color={colors.textSecondary} name="globe" size={18} />
              <Text style={[styles.socialBtnText, {color: colors.textPrimary}]}>Google</Text>
            </Pressable>
            <Pressable
              style={({pressed}) => [
                styles.socialBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Feather color={colors.textSecondary} name="smartphone" size={18} />
              <Text style={[styles.socialBtnText, {color: colors.textPrimary}]}>Apple</Text>
            </Pressable>
          </View>

          {/* Sign up link */}
          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            style={styles.signUpWrap}>
            <Text style={[styles.signUpText, {color: colors.textSecondary}]}>
              Don&apos;t have an account?{' '}
              <Text style={[styles.signUpLink, {color: colors.primary}]}>Sign Up</Text>
            </Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    marginBottom: 8,
    paddingVertical: 4,
    width: 36,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginVertical: 20,
  },
  dividerText: {
    fontSize: 12,
  },
  errorBanner: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  errorBannerText: {fontSize: 13},
  fiBox: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: 14,
  },
  fiContainer: {
    marginTop: 8,
  },
  fiErrorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  fiErrorText: {
    fontSize: 12,
  },
  fiInputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  fiLabel: {
    position: 'absolute',
    top: 0,
  },
  fiLeftIcon: {
    marginRight: 10,
  },
  fiTextInput: {
    flex: 1,
    fontSize: 15,
  },
  flex: {flex: 1},
  forgotText: {
    fontSize: 12,
    fontWeight: '500',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  heroCircle: {
    alignItems: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  heroSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: 32,
  },
  noticeBanner: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  noticeText: {fontSize: 13},
  safe: {flex: 1},
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  signInBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    marginTop: 24,
  },
  signInBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  signUpLink: {
    fontWeight: '700',
  },
  signUpText: {
    fontSize: 13,
    textAlign: 'center',
  },
  signUpWrap: {
    alignItems: 'center',
    marginTop: 20,
  },
  socialBtn: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 48,
    justifyContent: 'center',
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
