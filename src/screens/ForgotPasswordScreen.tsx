import type {NativeStackScreenProps} from '@react-navigation/native-stack';
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

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const schema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email.').required('Email is required.'),
});

// ─── FloatingInput ────────────────────────────────────────────────────────────

type FloatingInputProps = {
  error?: string;
  label: string;
  leftIcon: string;
  onBlur?: () => void;
  onChangeText: (text: string) => void;
  touched?: boolean;
  value: string;
};

function FloatingInput({
  error,
  label,
  leftIcon,
  onBlur,
  onChangeText,
  touched,
  value,
}: FloatingInputProps): React.JSX.Element {
  const {colors} = useTheme();
  const [focused, setFocused] = useState(false);
  const animVal = useRef(new Animated.Value(value ? 1 : 0)).current;

  const hasError = touched && error;
  const isFloated = focused || value.length > 0;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(animVal, {duration: 150, toValue: 1, useNativeDriver: false}).start();
  };

  const handleBlur = () => {
    setFocused(false);
    if (!value) {
      Animated.timing(animVal, {duration: 150, toValue: 0, useNativeDriver: false}).start();
    }
    onBlur?.();
  };

  const labelFontSize = animVal.interpolate({inputRange: [0, 1], outputRange: [14, 11]});
  const labelTranslateY = animVal.interpolate({inputRange: [0, 1], outputRange: [0, -10]});
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
            borderColor: hasError ? colors.error : focused ? colors.primary : colors.border,
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
            autoCapitalize="none"
            keyboardType="email-address"
            onBlur={handleBlur}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            style={[
              styles.fiTextInput,
              {color: colors.textPrimary, paddingTop: isFloated ? 14 : 0},
            ]}
            value={value}
          />
        </View>
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

// ─── SuccessState ─────────────────────────────────────────────────────────────

function SuccessState({onBack}: {onBack: () => void}): React.JSX.Element {
  const {colors} = useTheme();
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {bounciness: 10, speed: 10, toValue: 1, useNativeDriver: true}),
      Animated.timing(opacity, {duration: 400, toValue: 1, useNativeDriver: true}),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={[styles.successWrap, {opacity}]}>
      <Animated.View
        style={[
          styles.successCircle,
          {
            backgroundColor: colors.success + '26',
            transform: [{scale}],
          },
        ]}>
        <Feather color={colors.success} name="check-circle" size={36} />
      </Animated.View>

      <Animated.Text style={[styles.successTitle, {color: colors.textPrimary, opacity}]}>
        Email sent!
      </Animated.Text>
      <Animated.Text style={[styles.successSubtitle, {color: colors.textSecondary, opacity}]}>
        Check your inbox for a link to reset your password.
      </Animated.Text>

      <Pressable
        onPress={onBack}
        style={({pressed}) => [
          styles.primaryBtn,
          {backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1},
        ]}>
        <Text style={styles.primaryBtnText}>Back to Sign In</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── ForgotPasswordScreen ─────────────────────────────────────────────────────

export default function ForgotPasswordScreen({navigation}: Props): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (val: string) => {
    if (!val.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Enter a valid email.';
    return '';
  };

  const handleSend = async () => {
    setTouched(true);
    const err = validate(email);
    setEmailError(err);
    if (err) return;

    try {
      setFormError('');
      setIsSubmitting(true);
      await socialAuth.resetPassword(email);
      setSent(true);
    } catch {
      setFormError('Unable to send a reset link right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Login')}
            style={styles.backBtn}>
            <Feather color={colors.textPrimary} name="arrow-left" size={22} />
          </Pressable>

          {sent ? (
            <SuccessState onBack={() => navigation.navigate('Login')} />
          ) : (
            <>
              {/* Hero */}
              <View style={styles.heroWrap}>
                <View style={[styles.heroCircle, {backgroundColor: 'rgba(108,99,255,0.15)'}]}>
                  <Feather color={colors.primary} name="send" size={32} />
                </View>
              </View>

              <Text style={[styles.title, {color: colors.textPrimary}]}>
                Forgot your password?
              </Text>
              <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
                Enter your email and we'll send a reset link right away.
              </Text>

              {formError ? (
                <View
                  style={[
                    styles.errorBanner,
                    {backgroundColor: colors.error + '15', borderColor: colors.error + '30'},
                  ]}>
                  <Text style={[styles.errorBannerText, {color: colors.error}]}>{formError}</Text>
                </View>
              ) : null}

              {/* EMAIL label */}
              <Text style={[styles.sectionLabel, {color: colors.textSecondary}]}>
                EMAIL ADDRESS
              </Text>

              <FloatingInput
                error={emailError}
                label="your@email.com"
                leftIcon="mail"
                onBlur={() => {
                  setTouched(true);
                  setEmailError(validate(email));
                }}
                onChangeText={val => {
                  setEmail(val);
                  if (touched) setEmailError(validate(val));
                }}
                touched={touched}
                value={email}
              />

              <Pressable
                disabled={isSubmitting}
                onPress={handleSend}
                style={({pressed}) => [
                  styles.primaryBtn,
                  {
                    backgroundColor: colors.primary,
                    marginTop: 24,
                    opacity: pressed || isSubmitting ? 0.8 : 1,
                  },
                ]}>
                <Text style={styles.primaryBtnText}>
                  {isSubmitting ? 'Sending…' : 'Send Reset Link'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Login')}
                style={styles.backLinkWrap}>
                <Text style={[styles.backLinkText, {color: colors.textSecondary}]}>
                  Back to Sign In
                </Text>
              </Pressable>
            </>
          )}

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
  backLinkText: {fontSize: 13, textAlign: 'center'},
  backLinkWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  errorBanner: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
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
  fiErrorText: {fontSize: 12},
  fiInputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  fiLabel: {
    position: 'absolute',
    top: 0,
  },
  fiLeftIcon: {marginRight: 10},
  fiTextInput: {
    flex: 1,
    fontSize: 15,
  },
  flex: {flex: 1},
  heroCircle: {
    alignItems: 'center',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  heroWrap: {
    alignItems: 'center',
    marginTop: 48,
  },
  primaryBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    width: '100%',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  safe: {flex: 1},
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 24,
    textTransform: 'uppercase',
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  successCircle: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  successSubtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginHorizontal: 24,
    marginTop: 8,
    textAlign: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  successWrap: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 24,
    width: '100%',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    marginHorizontal: 0,
    marginTop: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
});
