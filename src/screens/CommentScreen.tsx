import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {addComment, fetchComments} from '../store/slices/postsSlice';
import {useTheme} from '../theme/ThemeContext';
import type {RootStackParamList} from '../types/navigation';
import {formatTimestamp} from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Comments'>;

export default function CommentScreen({navigation, route}: Props): React.JSX.Element {
  const {colors} = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const post = useAppSelector(state =>
    state.posts.items.find(item => item.id === route.params.postId),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchComments(route.params.postId)).finally(() => setIsLoading(false));
  }, [dispatch, route.params.postId]);

  const comments = useMemo(() => post?.comments ?? [], [post?.comments]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Write a comment first.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await dispatch(addComment({postId: route.params.postId, text})).unwrap();
      setText('');
    } catch {
      setError('Could not post your comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
      />
      {/* Header */}
      <SafeAreaView edges={['top']}>
        <View style={[styles.header, {borderBottomColor: colors.border}]}>
          <View style={[styles.handle, {backgroundColor: colors.textMuted}]} />
          <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>
            Comments {comments.length > 0 ? `(${comments.length})` : ''}
          </Text>
          <Pressable
            hitSlop={12}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            style={styles.closeBtn}>
            <Text style={[styles.closeIcon, {color: colors.textSecondary}]}>✕</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        {isLoading ? (
          <View style={styles.center}>
            <Text style={[styles.loadingText, {color: colors.textMuted}]}>
              Loading comments…
            </Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={styles.list}
            data={comments}
            keyExtractor={item => item.id}
            ListEmptyComponent={
              <EmptyState
                heading="No comments yet"
                illustration="💬"
                subtext="Be the first to comment!"
              />
            }
            renderItem={({item}) => (
              <View style={styles.commentItem}>
                <Avatar name={item.authorName} size={36} />
                <View style={styles.bubble}>
                  <View
                    style={[
                      styles.bubbleContent,
                      {backgroundColor: colors.surface},
                    ]}>
                    <Text style={[styles.commentAuthor, {color: colors.textPrimary}]}>
                      {item.authorName}
                    </Text>
                    <Text style={[styles.commentText, {color: colors.textPrimary}]}>
                      {item.text}
                    </Text>
                  </View>
                  <View style={styles.commentMeta}>
                    <Text style={[styles.commentTime, {color: colors.textMuted}]}>
                      {formatTimestamp(item.createdAt)}
                    </Text>
                    <Pressable style={styles.replyBtn}>
                      <Text style={[styles.replyText, {color: colors.textMuted}]}>
                        Reply
                      </Text>
                    </Pressable>
                    <View style={styles.commentLike}>
                      <Text style={[styles.heartSmall, {color: colors.textMuted}]}>♡</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input bar */}
        <SafeAreaView edges={['bottom']}>
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: colors.card,
                borderTopColor: colors.border,
              },
            ]}>
            {error ? (
              <Text style={[styles.errorText, {color: colors.error}]}>{error}</Text>
            ) : null}
            <View style={styles.inputRow}>
              <Avatar name={user?.name} size={32} uri={user?.photoUri} />
              <TextInput
                multiline
                onChangeText={t => {
                  setText(t);
                  setError('');
                }}
                placeholder="Add a comment…"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  },
                ]}
                value={text}
              />
              <Pressable
                disabled={!text.trim() || isSubmitting}
                onPress={handleSubmit}
                style={({pressed}) => [
                  styles.sendBtn,
                  {
                    backgroundColor:
                      text.trim() && !isSubmitting
                        ? colors.primary
                        : colors.primary + '50',
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}>
                <Text style={styles.sendIcon}>➤</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {flex: 1, marginLeft: 10},
  bubbleContent: {borderRadius: 12, padding: 12},
  center: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  closeBtn: {padding: 4},
  closeIcon: {fontSize: 18},
  commentAuthor: {fontSize: 13, fontWeight: '600', marginBottom: 3},
  commentItem: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentLike: {marginLeft: 'auto', paddingLeft: 8},
  commentMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 5,
    paddingLeft: 4,
  },
  commentText: {fontSize: 14, lineHeight: 20},
  commentTime: {fontSize: 11},
  container: {flex: 1},
  errorText: {fontSize: 12, marginBottom: 6},
  flex: {flex: 1},
  handle: {
    alignSelf: 'center',
    borderRadius: 4,
    height: 4,
    marginBottom: 12,
    marginTop: 4,
    width: 36,
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 12,
    paddingHorizontal: 20,
    position: 'relative',
  },
  headerTitle: {fontSize: 17, fontWeight: '600', textAlign: 'center'},
  heartSmall: {fontSize: 15},
  input: {
    borderRadius: 20,
    borderWidth: 1.5,
    flex: 1,
    fontSize: 14,
    marginHorizontal: 10,
    maxHeight: 80,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inputRow: {alignItems: 'center', flexDirection: 'row'},
  list: {paddingBottom: 16, paddingHorizontal: 16, paddingTop: 12},
  loadingText: {fontSize: 14},
  replyBtn: {paddingHorizontal: 2},
  replyText: {fontSize: 12, fontWeight: '500'},
  sendBtn: {
    alignItems: 'center',
    borderRadius: 9999,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  sendIcon: {color: '#fff', fontSize: 14, marginLeft: 2},
});
