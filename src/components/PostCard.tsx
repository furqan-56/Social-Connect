import React, {useState} from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Avatar from './Avatar';
import {useTheme} from '../theme/ThemeContext';
import {hapticLight} from '../utils/haptics';
import type {Post} from '../types/social';
import {formatTimestamp} from '../utils/date';

type PostCardProps = {
  onAuthorPress: (userId: string) => void;
  onCommentPress: (postId: string) => void;
  onToggleLike: (postId: string) => void;
  post: Post;
};

const MAX_LINES = 4;

export default React.memo(function PostCard({
  onAuthorPress,
  onCommentPress,
  onToggleLike,
  post,
}: PostCardProps): React.JSX.Element {
  const {colors} = useTheme();
  const [expanded,    setExpanded]    = useState(false);
  const [bookmarked,  setBookmarked]  = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const isLong  = post.text.length > 200;
  const handle  = '@' + post.authorName.toLowerCase().replace(/\s+/g, '_');
  const time    = formatTimestamp(post.createdAt);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.primary,
        },
      ]}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => onAuthorPress(post.authorId)}
          style={styles.authorRow}>
          {/* Avatar 36px with 2px primary ring */}
          <View style={[styles.avatarRing, {borderColor: colors.primary}]}>
            <Avatar name={post.authorName} size={32} uri={post.authorAvatarUri} />
          </View>
          <View style={styles.authorMeta}>
            <Text numberOfLines={1} style={[styles.authorName, {color: colors.textPrimary}]}>
              {post.authorName}
            </Text>
            <Text style={[styles.handleTime, {color: colors.textSecondary}]}>
              {handle}
              <Text style={[styles.dot, {color: colors.textMuted}]}> · </Text>
              <Text style={{color: colors.textMuted}}>{time}</Text>
            </Text>
          </View>
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => { hapticLight(); setMenuVisible(true); }}
          style={styles.moreBtn}>
          <Feather color={colors.textMuted} name="more-horizontal" size={20} />
        </Pressable>
      </View>

      {/* ── CONTENT TEXT ── */}
      {post.text ? (
        <View style={styles.bodyWrap}>
          <Text
            numberOfLines={expanded ? undefined : MAX_LINES}
            style={[styles.bodyText, {color: colors.textPrimary}]}>
            {post.text}
          </Text>
          {isLong && !expanded ? (
            <Pressable onPress={() => setExpanded(true)}>
              <Text style={[styles.readMore, {color: colors.primary}]}>
                Read more
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* ── IMAGE ── */}
      {post.imageUri ? (
        <View style={styles.imageWrap}>
          <Image
            resizeMode="cover"
            source={{uri: post.imageUri}}
            style={[styles.postImage, {backgroundColor: colors.surfaceAlt}]}
          />
        </View>
      ) : null}

      {/* ── ACTIONS ── */}
      <View style={styles.actions}>
        {/* Like */}
        <Pressable
          onPress={() => { hapticLight(); onToggleLike(post.id); }}
          style={({pressed}) => [styles.actionGroup, {opacity: pressed ? 0.6 : 1}]}>
          {post.likedByMe ? (
            <MaterialCommunityIcons color={colors.error} name="heart" size={20} />
          ) : (
            <Feather color={colors.textSecondary} name="heart" size={20} />
          )}
          <Text style={[styles.actionCount, {color: colors.textSecondary}]}>
            {post.likeCount}
          </Text>
        </Pressable>

        {/* Comment */}
        <Pressable
          onPress={() => { hapticLight(); onCommentPress(post.id); }}
          style={({pressed}) => [styles.actionGroup, {opacity: pressed ? 0.6 : 1}]}>
          <Feather color={colors.textSecondary} name="message-circle" size={20} />
          <Text style={[styles.actionCount, {color: colors.textSecondary}]}>
            {post.comments.length}
          </Text>
        </Pressable>

        {/* Share */}
        <Pressable
          onPress={() => hapticLight()}
          style={({pressed}) => [styles.actionGroup, {opacity: pressed ? 0.6 : 1}]}>
          <Feather color={colors.textSecondary} name="share-2" size={20} />
        </Pressable>

        {/* Bookmark — far right */}
        <Pressable
          onPress={() => { hapticLight(); setBookmarked(b => !b); }}
          style={({pressed}) => [
            styles.actionGroup,
            styles.bookmarkBtn,
            {opacity: pressed ? 0.6 : 1},
          ]}>
          {bookmarked ? (
            <MaterialCommunityIcons color={colors.primary} name="bookmark" size={20} />
          ) : (
            <Feather color={colors.textSecondary} name="bookmark" size={20} />
          )}
        </Pressable>
      </View>

      {/* ── CONTEXT MENU MODAL ── */}
      <Modal
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
        transparent
        visible={menuVisible}>
        <Pressable
          onPress={() => setMenuVisible(false)}
          style={[styles.overlay, {backgroundColor: colors.overlay}]}>
          <View
            style={[
              styles.menu,
              {backgroundColor: colors.surface, shadowColor: colors.primary},
            ]}>
            <View style={[styles.handle, {backgroundColor: colors.textMuted}]} />
            {['Edit Post', 'Delete Post', 'Report', 'Copy Link'].map(action => (
              <Pressable
                key={action}
                onPress={() => setMenuVisible(false)}
                style={({pressed}) => [
                  styles.menuItem,
                  {
                    backgroundColor: pressed ? colors.surfaceAlt : 'transparent',
                    borderBottomColor: colors.divider,
                  },
                ]}>
                <Text
                  style={[
                    styles.menuItemText,
                    {
                      color:
                        action === 'Delete Post' || action === 'Report'
                          ? colors.error
                          : colors.textPrimary,
                    },
                  ]}>
                  {action}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  actionCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginRight: 20,
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 12,
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
  },
  authorRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  avatarRing: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 1,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },
  bodyWrap: {
    paddingHorizontal: 14,
  },
  bookmarkBtn: {
    marginLeft: 'auto',
    marginRight: 0,
  },
  card: {
    borderRadius: 20,
    borderWidth: 0.5,
    marginBottom: 10,
    marginHorizontal: 14,
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },
  dot: {
    fontWeight: '400',
  },
  handle: {
    alignSelf: 'center',
    borderRadius: 4,
    height: 4,
    marginBottom: 16,
    width: 36,
  },
  handleTime: {
    fontSize: 11,
    marginTop: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  imageWrap: {
    marginBottom: 8,
    marginHorizontal: 14,
    marginTop: 8,
  },
  menu: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowOffset: {height: -4, width: 0},
    shadowOpacity: 0.08,
    shadowRadius: 20,
  },
  menuItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  moreBtn: {padding: 2},
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  postImage: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    width: '100%',
  },
  readMore: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
});
