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

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

// ─── Validation schemas ───────────────────────────────────────────────────────

const step1Schema = Yup.object({
  email: Yup.string().trim().email('Enter a valid email.').required('Email is required.'),
  name: Yup.string().trim().min(2, 'Min 2 characters.').required('Name is required.'),
  username: Yup.string()
    .trim()
    .min(3, 'Min 3 characters.')
    .matches(/^[a-z0-9_.]+$/, 'Only lowercase letters, numbers, _ and .')
    .required('Username is required.'),
});

const step2Schema = Yup.object({
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match.')
    .required('Confirm your password.'),
  password: Yup.string()
    .min(8, 'Min 8 characters.')
    .matches(/[A-Z]/, 'Needs one uppercase letter.')
    .matches(/[0-9]/, 'Needs one number.')
    .required('Password is required.'),
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
            autoCapitalize={autoCapitalize}
            keyboardType={keyboardType}
            onBlur={handleBlur}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            secureTextEntry={secureTextEntry && !showPass}
            style={[
              styles.fiTextInput,
              {color: colors.textPrimary, paddingTop: isFloated ? 14 : 0},
            ]}
            value={value}
          />
        </View>
        {secureTextEntry && (
          <Pressable hitSlop={8} onPress={() => setShowPass(s => !s)}>
            <Feather color={colors.textSecondary} name={showPass ? 'eye-off' : 'eye'} size={18} />
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

// ─── PasswordStrengthBar ──────────────────────────────────────────────────────

function PasswordStrengthBar({password}: {password: string}): React.JSX.Element {
  const {colors} = useTheme();
  if (!password) return <View />;

  // Determine level: weak=1, medium=2, strong=3
  let level = 1;
  if (password.length >= 6 && /[a-zA-Z]/.test(password)) level = 2;
  if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) level = 3;

  const labelMap = ['', 'Weak', 'Medium strength', 'Strong'];
  const colorMap = ['', colors.error, '#F59E0B', '#22C55E'];

  const barColor = colorMap[level];
  const labelText = labelMap[level];

  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthBars}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[
              styles.strengthBar,
              {backgroundColor: i <= level ? barColor : colors.surfaceAlt},
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, {color: barColor}]}>{labelText}</Text>
    </View>
  );
}

// ─── SummaryCard (Step 3) ─────────────────────────────────────────────────────

function SummaryCard({
  name,
  username,
  email,
}: {
  name: string;
  username: string;
  email: string;
}): React.JSX.Element {
  const {colors} = useTheme();
  const rows: Array<{icon: string; label: string; value: string}> = [
    {icon: 'user', label: 'Name', value: name},
    {icon: 'at-sign', label: 'Username', value: username},
    {icon: 'mail', label: 'Email', value: email},
  ];

  return (
    <View style={[styles.summaryCard, {backgroundColor: colors.surfaceAlt}]}>
      {rows.map((row, idx) => (
        <View
          key={row.label}
          style={[
            styles.summaryRow,
            idx < rows.length - 1 && {borderBottomWidth: 1, borderBottomColor: colors.border},
          ]}>
          <Feather color={colors.primary} name={row.icon} size={16} style={styles.summaryIcon} />
          <View>
            <Text style={[styles.summaryLabel, {color: colors.textMuted}]}>{row.label}</Text>
            <Text style={[styles.summaryValue, {color: colors.textPrimary}]}>{row.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

const STEP_LABELS = ['', 'Your info', 'Set password', 'Review'];

function StepProgressBar({step}: {step: number}): React.JSX.Element {
  const {colors} = useTheme();

  const getSegmentColor = (segIdx: number) => {
    if (step > segIdx) return '#22C55E';
    if (step === segIdx) return colors.primary;
    return colors.surfaceAlt;
  };

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressBarRow}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={[styles.progressSegment, {backgroundColor: getSegmentColor(i)}]}
          />
        ))}
      </View>
      <Text style={[styles.progressLabel, {color: colors.textSecondary}]}>
        Step {step} of 3 — {STEP_LABELS[step]}
      </Text>
    </View>
  );
}

// ─── HeroIcon ─────────────────────────────────────────────────────────────────

function HeroIcon({step}: {step: number}): React.JSX.Element {
  const {colors} = useTheme();
  const iconMap: Record<number, {name: string; color: string; bg: string}> = {
    1: {name: 'user-plus', color: colors.primary, bg: 'rgba(108,99,255,0.15)'},
    2: {name: 'lock', color: colors.primary, bg: 'rgba(108,99,255,0.15)'},
    3: {name: 'check-circle', color: colors.success, bg: colors.success + '26'},
  };
  const icon = iconMap[step] ?? iconMap[1];

  return (
    <View style={styles.heroWrap}>
      <View style={[styles.heroCircle, {backgroundColor: icon.bg}]}>
        <Feather color={icon.color} name={icon.name} size={32} />
      </View>
    </View>
  );
}

// ─── SignUpScreen ─────────────────────────────────────────────────────────────

export default function SignUpScreen({navigation}: Props): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState('');
  const [step1Data, setStep1Data] = useState({email: '', name: '', username: ''});
  const [step2Data, setStep2Data] = useState({confirmPassword: '', password: ''});

  const stepTitles = ['Create Account', 'Set your password', 'Almost done!'];
  const stepSubtitles = ['Tell us about yourself', '', ''];

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
            onPress={() => {
              if (step > 1) {
                setStep(s => s - 1);
              } else if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
            style={styles.backBtn}>
            <Feather color={colors.textPrimary} name="arrow-left" size={22} />
          </Pressable>

          {/* Step progress bar */}
          <StepProgressBar step={step} />

          {/* Hero icon */}
          <HeroIcon step={step} />

          {/* Title / subtitle */}
          <Text style={[styles.title, {color: colors.textPrimary}]}>
            {stepTitles[step - 1]}
          </Text>
          {stepSubtitles[step - 1] ? (
            <Text style={[styles.subtitle, {color: colors.textSecondary}]}>
              {stepSubtitles[step - 1]}
            </Text>
          ) : null}

          {/* Step 1 */}
          {step === 1 && (
            <Formik
              initialValues={step1Data}
              onSubmit={values => {
                setStep1Data(values);
                setStep(2);
              }}
              validationSchema={step1Schema}>
              {({errors, handleBlur, handleChange, handleSubmit, touched, values}) => (
                <>
                  <FloatingInput
                    autoCapitalize="words"
                    error={errors.name}
                    label="Full Name"
                    leftIcon="user"
                    onBlur={() => handleBlur('name')({} as any)}
                    onChangeText={handleChange('name')}
                    touched={touched.name}
                    value={values.name}
                  />
                  <FloatingInput
                    error={errors.username}
                    label="Username"
                    leftIcon="at-sign"
                    onBlur={() => handleBlur('username')({} as any)}
                    onChangeText={handleChange('username')}
                    touched={touched.username}
                    value={values.username}
                  />
                  <FloatingInput
                    autoCapitalize="none"
                    error={errors.email}
                    keyboardType="email-address"
                    label="Email address"
                    leftIcon="mail"
                    onBlur={() => handleBlur('email')({} as any)}
                    onChangeText={handleChange('email')}
                    touched={touched.email}
                    value={values.email}
                  />
                  <Pressable
                    onPress={() => handleSubmit()}
                    style={({pressed}) => [
                      styles.primaryBtn,
                      {backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1},
                    ]}>
                    <Text style={styles.primaryBtnText}>Next Step</Text>
                  </Pressable>
                </>
              )}
            </Formik>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <Formik
              initialValues={step2Data}
              onSubmit={values => {
                setStep2Data(values);
                setStep(3);
              }}
              validationSchema={step2Schema}>
              {({errors, handleBlur, handleChange, handleSubmit, touched, values}) => (
                <>
                  <FloatingInput
                    error={errors.password}
                    label="Password"
                    leftIcon="lock"
                    onBlur={() => handleBlur('password')({} as any)}
                    onChangeText={handleChange('password')}
                    secureTextEntry
                    touched={touched.password}
                    value={values.password}
                  />
                  <PasswordStrengthBar password={values.password} />
                  <FloatingInput
                    error={errors.confirmPassword}
                    label="Confirm Password"
                    leftIcon="lock"
                    onBlur={() => handleBlur('confirmPassword')({} as any)}
                    onChangeText={handleChange('confirmPassword')}
                    secureTextEntry
                    touched={touched.confirmPassword}
                    value={values.confirmPassword}
                  />
                  <Pressable
                    onPress={() => handleSubmit()}
                    style={({pressed}) => [
                      styles.primaryBtn,
                      {backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1},
                    ]}>
                    <Text style={styles.primaryBtnText}>Next Step</Text>
                  </Pressable>
                </>
              )}
            </Formik>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <>
              {formError ? (
                <View
                  style={[
                    styles.errorBanner,
                    {backgroundColor: colors.error + '15', borderColor: colors.error + '30'},
                  ]}>
                  <Text style={[styles.errorBannerText, {color: colors.error}]}>{formError}</Text>
                </View>
              ) : null}

              <SummaryCard
                email={step1Data.email}
                name={step1Data.name}
                username={step1Data.username}
              />

              <Text style={[styles.termsText, {color: colors.textSecondary}]}>
                By creating an account you agree to our Terms and Privacy Policy.
              </Text>

              <Pressable
                onPress={async () => {
                  try {
                    setFormError('');
                    await socialAuth.signUp({
                      email: step1Data.email,
                      name: step1Data.name,
                      password: step2Data.password,
                    });
                    navigation.navigate('Login', {
                      notice: `Account created! Welcome, ${step1Data.name.split(' ')[0]}.`,
                    });
                  } catch {
                    setFormError('Unable to create your account right now.');
                  }
                }}
                style={({pressed}) => [
                  styles.primaryBtn,
                  {backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1},
                ]}>
                <Text style={styles.primaryBtnText}>Create Account</Text>
              </Pressable>
            </>
          )}

          {/* Already have an account */}
          <Pressable
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLinkWrap}>
            <Text style={[styles.loginLinkText, {color: colors.textSecondary}]}>
              Already have an account?{' '}
              <Text style={[styles.loginLinkBold, {color: colors.primary}]}>Sign In</Text>
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
    marginTop: 12,
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
    marginTop: 20,
  },
  loginLinkBold: {fontWeight: '700'},
  loginLinkText: {fontSize: 12, textAlign: 'center'},
  loginLinkWrap: {
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtn: {
    alignItems: 'center',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  progressBarRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressLabel: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
  progressSegment: {
    borderRadius: 2,
    flex: 1,
    height: 4,
  },
  progressWrap: {
    marginHorizontal: 24,
    marginTop: 4,
  },
  safe: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  strengthBar: {
    borderRadius: 2,
    flex: 1,
    height: 4,
  },
  strengthBars: {
    flex: 1,
    flexDirection: 'row',
    gap: 3,
  },
  strengthLabel: {
    fontSize: 11,
    marginLeft: 8,
  },
  strengthWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 14,
    marginTop: 16,
    overflow: 'hidden',
  },
  summaryIcon: {marginRight: 12},
  summaryLabel: {fontSize: 11, marginBottom: 2},
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryValue: {fontSize: 14, fontWeight: '600'},
  termsText: {
    fontSize: 11,
    marginTop: 16,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
});
