import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import React, {useState} from 'react';
import {
  Alert,
  Image,
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
import Avatar from '../components/Avatar';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {createPost} from '../store/slices/postsSlice';
import {useTheme} from '../theme/ThemeContext';
import type {RootStackParamList} from '../types/navigation';

const MAX_CHARS = 280;

type Audience = 'Everyone' | 'Friends' | 'Only me';

const AUDIENCE_CYCLE: Audience[] = ['Everyone', 'Friends', 'Only me'];
const AUDIENCE_ICON: Record<Audience, string> = {
  Everyone: 'globe',
  Friends: 'users',
  'Only me': 'lock',
};

// ─── CharacterCounter ─────────────────────────────────────────────────────────

function CharCounter({remaining}: {remaining: number}): React.JSX.Element {
  const {colors} = useTheme();
  const borderColor =
    remaining < 20
      ? colors.error
      : remaining < 60
      ? '#F59E0B'
      : colors.surfaceAlt;
  const textColor =
    remaining < 20
      ? colors.error
      : remaining < 60
      ? '#F59E0B'
      : colors.textMuted;

  return (
    <View style={[styles.charCircle, {borderColor}]}>
      <Text style={[styles.charText, {color: textColor}]}>{remaining}</Text>
    </View>
  );
}

// ─── CreatePostScreen ─────────────────────────────────────────────────────────

export default function CreatePostScreen(): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [audience, setAudience] = useState<Audience>('Everyone');
  const [location, setLocation] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const charLeft = MAX_CHARS - text.length;
  const canPost = (text.trim().length > 0 || images.length > 0) && !isPosting;

  const cycleAudience = () => {
    setAudience(a => {
      const idx = AUDIENCE_CYCLE.indexOf(a);
      return AUDIENCE_CYCLE[(idx + 1) % AUDIENCE_CYCLE.length];
    });
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 10,
    });
    const uris = (result.assets ?? []).map(a => a.uri).filter(Boolean) as string[];
    if (uris.length > 0) {
      setImages(prev => [...prev, ...uris].slice(0, 9));
    }
  };

  const handleCamera = async () => {
    const result = await launchCamera({mediaType: 'photo', saveToPhotos: false});
    const uri = result.assets?.[0]?.uri;
    if (uri) {
      setImages(prev => [...prev, uri].slice(0, 9));
    }
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePost = async () => {
    if (!canPost) return;
    try {
      setIsPosting(true);
      await dispatch(createPost({imageUri: images[0], text: text.trim()})).unwrap();
      navigation.canGoBack() && navigation.goBack();
    } catch {
      setIsPosting(false);
      Alert.alert('Error', 'Could not create post. Please try again.');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((p: string) => p[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: colors.bg}]}>
      <StatusBar
        backgroundColor={colors.bg}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>

        {/* ── HEADER BAR ── */}
        <View style={[styles.header, {borderBottomColor: colors.border}]}>
          <Pressable
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            style={({pressed}) => [{opacity: pressed ? 0.6 : 1}]}>
            <Text style={[styles.cancelText, {color: colors.textSecondary}]}>Cancel</Text>
          </Pressable>

          <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>New Post</Text>

          <Pressable
            disabled={!canPost}
            onPress={handlePost}
            style={[
              styles.postBtn,
              {
                backgroundColor: colors.primary,
                opacity: canPost ? 1 : 0.4,
              },
            ]}>
            <Text style={styles.postBtnText}>{isPosting ? '…' : 'Post'}</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ── USER ROW ── */}
          <View style={styles.userRow}>
            <View
              style={[
                styles.avatarCircle,
                {backgroundColor: colors.surfaceAlt},
              ]}>
              {user?.photoUri ? (
                <Image
                  source={{uri: user.photoUri}}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={[styles.avatarInitials, {color: colors.textPrimary}]}>
                  {initials}
                </Text>
              )}
            </View>

            <View style={styles.userMeta}>
              <Text style={[styles.userName, {color: colors.textPrimary}]}>
                {user?.name ?? 'Social Member'}
              </Text>
              {/* Audience pill */}
              <Pressable
                onPress={cycleAudience}
                style={[styles.audiencePill, {backgroundColor: colors.surfaceAlt}]}>
                <Feather color={colors.primary} name={AUDIENCE_ICON[audience]} size={12} />
                <Text style={[styles.audienceText, {color: colors.primary}]}>{audience}</Text>
                <Feather color={colors.textSecondary} name="chevron-down" size={10} />
              </Pressable>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, {backgroundColor: colors.border}]} />

          {/* ── TEXT INPUT AREA ── */}
          <View style={styles.textArea}>
            <TextInput
              autoFocus
              multiline
              onChangeText={val => setText(val.slice(0, MAX_CHARS))}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.textSecondary}
              scrollEnabled={false}
              style={[styles.textInput, {color: colors.textPrimary}]}
              textAlignVertical="top"
              value={text}
            />
            {/* Character counter — absolute bottom-right of text area */}
            <CharCounter remaining={charLeft} />
          </View>

          {/* ── IMAGE THUMBNAIL STRIP ── */}
          {images.length > 0 && (
            <ScrollView
              contentContainerStyle={styles.thumbnailContent}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.thumbnailStrip, {backgroundColor: colors.surfaceAlt}]}>
              {images.map((uri, idx) => (
                <View key={uri + idx} style={styles.thumbnailWrap}>
                  <Image source={{uri}} style={[styles.thumbnail, {backgroundColor: colors.surfaceAlt}]} />
                  {/* Order badge */}
                  <View style={[styles.thumbBadge, {backgroundColor: colors.primary}]}>
                    <Text style={styles.thumbBadgeText}>{idx + 1}</Text>
                  </View>
                  {/* Remove button */}
                  <Pressable
                    onPress={() => handleRemoveImage(idx)}
                    style={styles.thumbRemove}>
                    <Feather color="#fff" name="x" size={10} />
                  </Pressable>
                </View>
              ))}
              {/* Add more button */}
              <Pressable
                onPress={handlePickImage}
                style={[
                  styles.thumbnailAddBtn,
                  {borderColor: colors.surfaceAlt},
                ]}>
                <Feather color={colors.textMuted} name="plus" size={24} />
              </Pressable>
            </ScrollView>
          )}

          {/* ── CHIPS ROW ── */}
          <View style={styles.chipsRow}>
            {location ? (
              <View style={[styles.chip, {backgroundColor: colors.surfaceAlt}]}>
                <Feather color={colors.primary} name="map-pin" size={14} />
                <Text style={[styles.chipText, {color: colors.primary}]}>{location}</Text>
                <Pressable hitSlop={8} onPress={() => setLocation(null)}>
                  <Feather color={colors.textMuted} name="x" size={12} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setLocation('Dubai, UAE')}
                style={styles.chipAction}>
                <Feather color={colors.textSecondary} name="map-pin" size={14} />
                <Text style={[styles.chipActionText, {color: colors.textSecondary}]}>Location</Text>
              </Pressable>
            )}

            <Pressable style={styles.chipAction}>
              <Feather color={colors.textSecondary} name="tag" size={14} />
              <Text style={[styles.chipActionText, {color: colors.textSecondary}]}>Tag people</Text>
            </Pressable>
          </View>

        </ScrollView>

        {/* ── BOTTOM TOOLBAR ── */}
        <SafeAreaView edges={['bottom']}>
          <View style={[styles.bottomBar, {borderTopColor: colors.border}]}>
            {/* Photo */}
            <Pressable
              onPress={handlePickImage}
              style={({pressed}) => [styles.toolbarBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Feather color={colors.primary} name="image" size={22} />
              <Text style={[styles.toolbarLabel, {color: colors.textSecondary}]}>Photo</Text>
            </Pressable>

            {/* Camera */}
            <Pressable
              onPress={handleCamera}
              style={({pressed}) => [styles.toolbarBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Feather color={colors.primary} name="camera" size={22} />
              <Text style={[styles.toolbarLabel, {color: colors.textSecondary}]}>Camera</Text>
            </Pressable>

            {/* Video */}
            <Pressable
              onPress={() => Alert.alert('Coming soon', 'Video posts are coming soon!')}
              style={({pressed}) => [styles.toolbarBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Feather color={colors.primary} name="video" size={22} />
              <Text style={[styles.toolbarLabel, {color: colors.textSecondary}]}>Video</Text>
            </Pressable>

            {/* Mood */}
            <Pressable
              onPress={() => Alert.alert('Coming soon', 'Mood tags are coming soon!')}
              style={({pressed}) => [styles.toolbarBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Feather color={colors.primary} name="smile" size={22} />
              <Text style={[styles.toolbarLabel, {color: colors.textSecondary}]}>Mood</Text>
            </Pressable>

            {/* Location */}
            <Pressable
              onPress={() => setLocation(location ? null : 'Dubai, UAE')}
              style={({pressed}) => [styles.toolbarBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Feather color={location ? colors.primary : colors.primary} name="map-pin" size={22} />
              <Text style={[styles.toolbarLabel, {color: colors.textSecondary}]}>Location</Text>
            </Pressable>
          </View>
        </SafeAreaView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  audiencePill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 9999,
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  audienceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  avatarCircle: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 40,
  },
  avatarImage: {
    height: 40,
    width: 40,
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomBar: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {fontSize: 14},
  charCircle: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 3,
    bottom: 12,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    width: 36,
  },
  charText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chip: {
    alignItems: 'center',
    borderRadius: 9999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipAction: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  chipActionText: {fontSize: 13},
  chipText: {fontSize: 12},
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  flex: {flex: 1},
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  postBtn: {
    alignItems: 'center',
    borderRadius: 9999,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  safe: {flex: 1},
  scroll: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  textArea: {
    minHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 12,
    position: 'relative',
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    paddingBottom: 48,
  },
  thumbBadge: {
    alignItems: 'center',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    left: 4,
    position: 'absolute',
    top: 4,
    width: 18,
  },
  thumbBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  thumbRemove: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 9,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 4,
    width: 18,
  },
  thumbnail: {
    borderRadius: 10,
    height: 72,
    width: 72,
  },
  thumbnailAddBtn: {
    alignItems: 'center',
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    height: 72,
    justifyContent: 'center',
    marginRight: 8,
    width: 72,
  },
  thumbnailContent: {
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  thumbnailStrip: {
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  thumbnailWrap: {
    marginRight: 8,
    position: 'relative',
  },
  toolbarBtn: {
    alignItems: 'center',
    gap: 4,
  },
  toolbarLabel: {
    fontSize: 10,
  },
  userMeta: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
});
