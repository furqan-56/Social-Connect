import {Asset, ImagePickerResponse, launchImageLibrary} from 'react-native-image-picker';
import React, {useState} from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Avatar from './Avatar';
import {useTheme} from '../theme/ThemeContext';
import {useAppSelector} from '../store/hooks';

type CreatePostProps = {
  onCreatePost: (payload: {imageUri?: string; text: string}) => Promise<void>;
};

function getSelectedAsset(response: ImagePickerResponse): Asset | undefined {
  return response.assets?.find(asset => Boolean(asset.uri));
}

export default function CreatePost({onCreatePost}: CreatePostProps): React.JSX.Element {
  const {colors} = useTheme();
  const user = useAppSelector(state => state.auth.user);
  const [imageUri, setImageUri] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const firstName = user?.name?.split(' ')[0] ?? 'you';
  const charLeft = 280 - text.length;

  const handlePickImage = async () => {
    const result = await launchImageLibrary({mediaType: 'photo', selectionLimit: 1});
    const asset = getSelectedAsset(result);
    if (asset?.uri) setImageUri(asset.uri);
  };

  const handleSubmit = async () => {
    if (!text.trim() && !imageUri) {
      setError('Write something or attach an image.');
      return;
    }
    try {
      setError('');
      setIsSubmitting(true);
      await onCreatePost({imageUri, text});
      setText('');
      setImageUri(undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPost = (text.trim().length > 0 || Boolean(imageUri)) && !isSubmitting;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: colors.shadow,
        },
      ]}>
      {/* User row */}
      <View style={styles.userRow}>
        <Avatar name={user?.name} size={40} uri={user?.photoUri} />
        <View style={styles.inputWrap}>
          <TextInput
            multiline
            onChangeText={t => {
              setText(t);
              setError('');
            }}
            placeholder={`What's on your mind, ${firstName}?`}
            placeholderTextColor={colors.textMuted}
            style={[styles.textInput, {color: colors.textPrimary}]}
            textAlignVertical="top"
            value={text}
          />
        </View>
      </View>

      {/* Image preview */}
      {imageUri ? (
        <View style={styles.previewWrap}>
          <Image source={{uri: imageUri}} style={styles.preview} />
          <Pressable
            onPress={() => setImageUri(undefined)}
            style={[styles.removeBtn, {backgroundColor: colors.error}]}>
            <Text style={styles.removeBtnText}>✕</Text>
          </Pressable>
        </View>
      ) : null}

      {error ? (
        <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
      ) : null}

      {/* Bottom bar */}
      <View style={[styles.bottomBar, {borderTopColor: colors.divider}]}>
        <View style={styles.actionIcons}>
          {[
            {icon: '⬡', onPress: handlePickImage, label: 'photo'},
            {icon: '⊡', onPress: handlePickImage, label: 'camera'},
            {icon: '◉', onPress: () => undefined, label: 'emoji'},
          ].map(item => (
            <Pressable
              key={item.label}
              onPress={item.onPress}
              style={({pressed}) => [styles.iconBtn, {opacity: pressed ? 0.6 : 1}]}>
              <Text style={[styles.iconBtnText, {color: colors.primary}]}>
                {item.icon}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.rightRow}>
          {text.length > 0 && (
            <Text
              style={[
                styles.charCount,
                {color: charLeft < 20 ? colors.error : colors.textMuted},
              ]}>
              {charLeft}
            </Text>
          )}
          <Pressable
            disabled={!canPost}
            onPress={handleSubmit}
            style={({pressed}) => [
              styles.postBtn,
              {
                backgroundColor: canPost ? colors.primary : colors.primary + '60',
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={styles.postBtnText}>
              {isSubmitting ? '...' : 'Post'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionIcons: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  bottomBar: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 13,
    marginRight: 10,
  },
  container: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 16,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
  },
  iconBtn: {
    padding: 8,
  },
  iconBtnText: {
    fontSize: 20,
  },
  inputWrap: {
    flex: 1,
    marginLeft: 12,
  },
  postBtn: {
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  preview: {
    aspectRatio: 16 / 9,
    backgroundColor: '#eef2f7',
    borderRadius: 12,
    width: '100%',
  },
  previewWrap: {
    marginTop: 12,
    position: 'relative',
  },
  removeBtn: {
    alignItems: 'center',
    borderRadius: 9999,
    height: 26,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 26,
  },
  removeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  rightRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  textInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 60,
  },
  userRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
});
