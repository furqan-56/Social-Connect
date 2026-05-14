import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Formik} from 'formik';
import {Asset, launchImageLibrary} from 'react-native-image-picker';
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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
import * as Yup from 'yup';
import Avatar from '../components/Avatar';
import AuthTextInput from '../components/AuthTextInput';
import {profileService} from '../services/profile';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {profileUpdated} from '../store/slices/authSlice';
import {useTheme} from '../theme/ThemeContext';
import type {RootStackParamList} from '../types/navigation';

const schema = Yup.object({
  bio: Yup.string().trim().max(160, 'Max 160 characters.'),
  name: Yup.string().trim().min(2, 'Min 2 characters.').required('Name is required.'),
  photoUri: Yup.string().optional(),
});

export default function EditProfileScreen(): React.JSX.Element {
  const {colors} = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const [isLoading, setIsLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({bio: '', name: '', photoUri: ''});

  useEffect(() => {
    profileService.getProfile().then(p => {
      setInitialValues({bio: p.bio ?? '', name: p.name ?? '', photoUri: p.photoUri ?? ''});
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loading, {backgroundColor: colors.background}]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: colors.background}]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
      />
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async (values, {setSubmitting}) => {
          const saved = await profileService.saveProfile(values);
          dispatch(profileUpdated(saved));
          setSubmitting(false);
          navigation.canGoBack() && navigation.goBack();
        }}
        validationSchema={schema}>
        {({dirty, errors, handleBlur, handleChange, handleSubmit, isSubmitting, setFieldValue, touched, values}) => {
          const handlePickPhoto = async () => {
            const result = await launchImageLibrary({
              mediaType: 'photo',
              selectionLimit: 1,
            });
            const uri = result.assets?.[0]?.uri;
            if (uri) setFieldValue('photoUri', uri);
          };

          const handleBack = () => {
            if (dirty) {
              Alert.alert(
                'Discard changes?',
                'You have unsaved changes.',
                [
                  {style: 'cancel', text: 'Keep editing'},
                  {
                    onPress: () => navigation.canGoBack() && navigation.goBack(),
                    style: 'destructive',
                    text: 'Discard',
                  },
                ],
              );
            } else {
              navigation.canGoBack() && navigation.goBack();
            }
          };

          return (
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.flex}>
              {/* Header */}
              <View style={[styles.header, {borderBottomColor: colors.border}]}>
                <Pressable hitSlop={12} onPress={handleBack}>
                  <Text style={[styles.backArrow, {color: colors.primary}]}>{'←'}</Text>
                </Pressable>
                <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
                  Edit Profile
                </Text>
                <Pressable
                  disabled={isSubmitting}
                  onPress={() => handleSubmit()}
                  style={({pressed}) => [{opacity: pressed || isSubmitting ? 0.6 : 1}]}>
                  <Text style={[styles.saveBtn, {color: colors.primary}]}>
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                  <View style={styles.avatarWrap}>
                    <Avatar
                      name={values.name}
                      size={88}
                      uri={values.photoUri || undefined}
                    />
                    <Pressable
                      onPress={handlePickPhoto}
                      style={[
                        styles.editBadge,
                        {backgroundColor: colors.primary, borderColor: colors.background},
                      ]}>
                      <Text style={styles.editBadgeText}>✏</Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={handlePickPhoto}>
                    <Text style={[styles.changePhotoText, {color: colors.primary}]}>
                      Change photo
                    </Text>
                  </Pressable>
                </View>

                {/* Form fields */}
                <View style={styles.fields}>
                  <AuthTextInput
                    autoCapitalize="words"
                    error={errors.name}
                    label="Display Name"
                    onBlur={handleBlur('name')}
                    onChangeText={handleChange('name')}
                    placeholder="Your name"
                    textContentType="name"
                    touched={touched.name}
                    value={values.name}
                  />

                  <View style={styles.bioField}>
                    <Text style={[styles.bioLabel, {color: colors.textSecondary}]}>
                      Bio
                    </Text>
                    <TextInput
                      maxLength={160}
                      multiline
                      numberOfLines={4}
                      onBlur={handleBlur('bio')}
                      onChangeText={handleChange('bio')}
                      placeholder="A short intro about yourself…"
                      placeholderTextColor={colors.textMuted}
                      style={[
                        styles.bioInput,
                        {
                          backgroundColor: colors.inputBackground,
                          borderColor: touched.bio && errors.bio ? colors.error : colors.border,
                          color: colors.textPrimary,
                        },
                      ]}
                      textAlignVertical="top"
                      value={values.bio}
                    />
                    <View style={styles.bioFooter}>
                      {touched.bio && errors.bio ? (
                        <Text style={[styles.bioError, {color: colors.error}]}>
                          {errors.bio}
                        </Text>
                      ) : <View />}
                      <Text style={[styles.charCount, {color: colors.textMuted}]}>
                        {values.bio.length}/160
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Save button pinned to bottom */}
              <View style={[styles.bottomBar, {borderTopColor: colors.border, backgroundColor: colors.background}]}>
                <SafeAreaView edges={['bottom']}>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => handleSubmit()}
                    style={({pressed}) => [
                      styles.saveBarBtn,
                      {
                        backgroundColor: colors.primary,
                        opacity: pressed || isSubmitting ? 0.75 : 1,
                      },
                    ]}>
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveBarBtnText}>Save Changes</Text>
                    )}
                  </Pressable>
                </SafeAreaView>
              </View>
            </KeyboardAvoidingView>
          );
        }}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarSection: {alignItems: 'center', marginBottom: 28, paddingTop: 20},
  avatarWrap: {position: 'relative'},
  backArrow: {fontSize: 22},
  bioError: {fontSize: 12},
  bioField: {marginBottom: 16},
  bioFooter: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 4},
  bioInput: {
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 15,
    minHeight: 96,
    padding: 14,
  },
  bioLabel: {fontSize: 13, fontWeight: '500', marginBottom: 7},
  bottomBar: {borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 20, paddingTop: 12},
  changePhotoText: {fontSize: 14, fontWeight: '500', marginTop: 10},
  charCount: {fontSize: 12},
  editBadge: {
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 2,
    bottom: 0,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 28,
  },
  editBadgeText: {color: '#fff', fontSize: 13},
  fields: {paddingHorizontal: 20},
  flex: {flex: 1},
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerTitle: {fontSize: 17, fontWeight: '600'},
  loading: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  safe: {flex: 1},
  saveBarBtn: {alignItems: 'center', borderRadius: 14, paddingVertical: 15},
  saveBarBtnText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  saveBtn: {fontSize: 15, fontWeight: '600'},
  scroll: {flexGrow: 1, paddingBottom: 24},
});
