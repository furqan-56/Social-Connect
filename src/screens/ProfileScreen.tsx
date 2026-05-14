import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import {auth} from '../config/firebase';
import {profileService} from '../services/profile';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {togglePostLike} from '../store/slices/likesSlice';
import {fetchPosts} from '../store/slices/postsSlice';
import {useTheme} from '../theme/ThemeContext';
import type {RootStackParamList} from '../types/navigation';

type Tab = 'posts' | 'liked' | 'saved';

type TabConfig = {id: Tab; icon: string; label: string};

export default function ProfileScreen(): React.JSX.Element {
  const {colors, isDark} = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch   = useAppDispatch();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {style: 'cancel', text: 'Cancel'},
      {
        onPress: async () => {
          try {
            await auth().signOut();
          } catch {}
        },
        style: 'destructive',
        text: 'Log Out',
      },
    ]);
  };
  const user       = useAppSelector(state => state.auth.user);
  const posts      = useAppSelector(state => state.posts.items);
  const likesByPostId = useAppSelector(state => state.likes.byPostId);
  const postStatus = useAppSelector(state => state.posts.status);
  const [activeTab, setActiveTab] = useState<Tab>('posts');

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts());
    }
  }, [dispatch, postStatus]);

  const userPosts = useMemo(
    () =>
      posts
        .filter(p => p.authorId === user?.id)
        .map(p => ({
          ...p,
          likedByMe: likesByPostId[p.id]?.likedByMe ?? p.likedByMe,
          likeCount: likesByPostId[p.id]?.likeCount ?? p.likeCount,
        })),
    [posts, user?.id, likesByPostId],
  );

  const TABS: TabConfig[] = [
    {icon: 'grid',     id: 'posts', label: 'Posts'},
    {icon: 'heart',    id: 'liked', label: 'Liked'},
    {icon: 'bookmark', id: 'saved', label: 'Saved'},
  ];

  // Gradient colors for the cover
  const coverColors: string[] = isDark
    ? ['#1E1A3A', '#2A1A30']
    : ['#E8E4FF', '#F8E4F0'];

  return (
    <View style={[styles.container, {backgroundColor: colors.bg}]}>
      <StatusBar
        backgroundColor="transparent"
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
      />

      <FlatList
        contentContainerStyle={styles.feedContent}
        data={activeTab === 'posts' ? userPosts : []}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          activeTab === 'posts' ? (
            <EmptyState
              heading="No posts yet"
              illustration="◯"
              subtext="Your posts will appear here."
            />
          ) : (
            <EmptyState
              heading={activeTab === 'liked' ? 'No liked posts' : 'Nothing saved'}
              illustration={activeTab === 'liked' ? '♡' : '☆'}
              subtext="Content you interact with will appear here."
            />
          )
        }
        ListHeaderComponent={
          <View>
            {/* ── COVER ── */}
            <LinearGradient
              colors={coverColors}
              end={{x: 1, y: 0}}
              start={{x: 0, y: 0}}
              style={styles.cover}
            />

            {/* ── LOGOUT TOP-RIGHT ── */}
            <Pressable
              onPress={handleLogout}
              style={({pressed}) => [
                styles.logoutBtn,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.error,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}>
              <Feather color={colors.error} name="log-out" size={17} />
            </Pressable>

            {/* ── PROFILE INFO ── */}
            <View style={styles.profileSection}>
              {/* Avatar overlapping cover */}
              <View
                style={[
                  styles.avatarRing,
                  {backgroundColor: colors.bg, borderColor: colors.primary},
                ]}>
                <Avatar
                  name={user?.name}
                  size={52}
                  storyRing="none"
                  uri={user?.photoUri}
                />
              </View>

              {/* Name */}
              <Text style={[styles.displayName, {color: colors.textPrimary}]}>
                {user?.name ?? 'Social Member'}
              </Text>

              {/* Handle */}
              <Text style={[styles.handle, {color: colors.textSecondary}]}>
                {'@' + (user?.name ?? 'user').toLowerCase().replace(/\s+/g, '_')}
              </Text>

              {/* Bio */}
              {user?.bio ? (
                <Text numberOfLines={3} style={[styles.bio, {color: colors.textPrimary}]}>
                  {user.bio}
                </Text>
              ) : (
                <Pressable onPress={() => navigation.navigate('EditProfile')}>
                  <Text style={[styles.bioPlaceholder, {color: colors.primary}]}>
                    + Add bio
                  </Text>
                </Pressable>
              )}

              {/* Stats row */}
              <View style={styles.statsRow}>
                {[
                  {label: 'Posts',     value: userPosts.length},
                  {label: 'Followers', value: 0},
                  {label: 'Following', value: 0},
                ].map(stat => (
                  <View key={stat.label} style={styles.statItem}>
                    <Text style={[styles.statCount, {color: colors.textPrimary}]}>
                      {stat.value}
                    </Text>
                    <Text style={[styles.statLabel, {color: colors.textSecondary}]}>
                      {stat.label}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => navigation.navigate('EditProfile')}
                  style={({pressed}) => [
                    styles.editBtn,
                    {borderColor: colors.primary, opacity: pressed ? 0.7 : 1},
                  ]}>
                  <Text style={[styles.editBtnText, {color: colors.primary}]}>
                    Edit Profile
                  </Text>
                </Pressable>

                <Pressable
                  style={({pressed}) => [
                    styles.shareBtn,
                    {
                      borderColor: colors.primary,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}>
                  <Feather color={colors.primary} name="share-2" size={18} />
                </Pressable>

              </View>
            </View>

            {/* ── TABS ── */}
            <View style={[styles.tabRow, {borderBottomColor: colors.border, borderTopColor: colors.border}]}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    style={[
                      styles.tabItem,
                      isActive
                        ? {borderBottomColor: colors.primary, borderBottomWidth: 2}
                        : null,
                    ]}>
                    <Feather
                      color={isActive ? colors.primary : colors.textMuted}
                      name={tab.icon as any}
                      size={20}
                    />
                  </Pressable>
                );
              })}
            </View>
            {/* spacing between tabs and first post */}
            <View style={styles.tabPostSpacer} />
          </View>
        }
        renderItem={({item}) => (
          <PostCard
            onAuthorPress={userId => navigation.navigate('UserProfile', {userId})}
            onCommentPress={postId => navigation.navigate('Comments', {postId})}
            onToggleLike={postId => dispatch(togglePostLike(postId))}
            post={item}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  avatarRing: {
    borderRadius: 32,
    borderWidth: 3,
    marginTop: -28,
    padding: 2,
  },
  bio: {
    fontSize: 13,
    lineHeight: 19,
    marginHorizontal: 24,
    marginTop: 4,
    textAlign: 'center',
  },
  bioPlaceholder: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  container: {flex: 1},
  cover: {
    height: 100,
    width: '100%',
  },
  displayName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  editBtn: {
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1.5,
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  editBtnText: {fontSize: 12, fontWeight: '700'},
  feedContent: {paddingBottom: 100},
  handle: {
    fontSize: 12,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  shareBtn: {
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1.5,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  statCount: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'center',
    marginTop: 16,
  },
  logoutBtn: {
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1.5,
    height: 34,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    top: 52,
    width: 34,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 14,
  },
  tabPostSpacer: {
    height: 10,
  },
  tabRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 20,
  },
});
