import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AppIcon from '../components/AppIcon';
import Avatar from '../components/Avatar';
import EmptyState from '../components/EmptyState';
import PostCard from '../components/PostCard';
import {profileService} from '../services/profile';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {togglePostLike} from '../store/slices/likesSlice';
import {fetchPosts} from '../store/slices/postsSlice';
import {useTheme} from '../theme/ThemeContext';
import {hapticLight, hapticMedium, hapticSuccess} from '../utils/haptics';
import type {RootStackParamList} from '../types/navigation';
import type {UserProfile} from '../types/social';

// ─── Animated follow button ───────────────────────────────────────────────────

function AnimatedFollowButton({
  following,
  onPress,
}: {
  following: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const {colors} = useTheme();
  const fillAnim = useRef(new Animated.Value(following ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevFollowing = useRef(following);

  useEffect(() => {
    if (following !== prevFollowing.current) {
      Animated.parallel([
        Animated.timing(fillAnim, {
          duration: 280,
          toValue: following ? 1 : 0,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.spring(scaleAnim, {
            bounciness: 14,
            speed: 32,
            toValue: following ? 0.93 : 1.06,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            bounciness: 8,
            speed: 18,
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
      prevFollowing.current = following;
    }
  }, [fillAnim, following, scaleAnim]);

  const handlePress = useCallback(() => {
    if (!following) {
      hapticSuccess();
    } else {
      hapticMedium();
    }
    onPress();
  }, [following, onPress]);

  // Fill fills from left to right
  const fillWidth = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  const textColor = fillAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [colors.primary, '#fff', '#fff'],
  });

  return (
    <Pressable onPress={handlePress} style={({pressed}) => [{opacity: pressed ? 0.85 : 1}, styles.followBtnWrap]}>
      <Animated.View
        style={[
          styles.followBtn,
          {
            borderColor: colors.primary,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Animated fill layer */}
        <Animated.View
          style={[
            styles.followFill,
            {backgroundColor: colors.primary, width: fillWidth},
          ]}
        />
        {/* Label on top */}
        <Animated.Text style={[styles.followBtnText, {color: textColor as any}]}>
          {following ? 'Following' : 'Follow'}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen({navigation, route}: Props): React.JSX.Element {
  const {colors} = useTheme();
  const dispatch = useAppDispatch();
  const likesByPostId = useAppSelector(state => state.likes.byPostId);
  const posts = useAppSelector(state => state.posts.items);
  const postStatus = useAppSelector(state => state.posts.status);
  const [profile, setProfile] = useState<UserProfile>();
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    profileService.getPublicProfile(route.params.userId).then(p => {
      setProfile(p);
      setIsLoading(false);
    });
  }, [route.params.userId]);

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts());
    }
  }, [dispatch, postStatus]);

  const userPosts = useMemo(
    () =>
      posts
        .filter(p => p.authorId === route.params.userId)
        .map(p => ({
          ...p,
          likedByMe: likesByPostId[p.id]?.likedByMe ?? p.likedByMe,
          likeCount: likesByPostId[p.id]?.likeCount ?? p.likeCount,
        })),
    [likesByPostId, posts, route.params.userId],
  );

  if (isLoading) {
    return (
      <View style={[styles.loading, {backgroundColor: colors.background}]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar
        backgroundColor={colors.background}
        barStyle={colors.background === '#FFFFFF' ? 'dark-content' : 'light-content'}
      />
      <SafeAreaView edges={['top']}>
        <View style={[styles.topBar, {borderBottomColor: colors.border}]}>
          <Pressable
            hitSlop={12}
            onPress={() => navigation.canGoBack() && navigation.goBack()}
            style={({pressed}) => [{opacity: pressed ? 0.6 : 1}]}>
            <Text style={[styles.backArrow, {color: colors.primary}]}>{'←'}</Text>
          </Pressable>
          <Text style={[styles.topTitle, {color: colors.textPrimary}]} numberOfLines={1}>
            {profile?.name ?? ''}
          </Text>
          <Pressable style={styles.moreBtn}>
            <Text style={[styles.moreIcon, {color: colors.textSecondary}]}>⋮</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <FlatList
        contentContainerStyle={[styles.content, {backgroundColor: colors.background}]}
        data={userPosts}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <EmptyState heading="No posts yet" illustration="◯" subtext="Nothing to show here." />
        }
        ListHeaderComponent={
          <View style={styles.profileSection}>
            <Avatar name={profile?.name} size={96} uri={profile?.photoUri} />
            <Text style={[styles.displayName, {color: colors.textPrimary}]}>
              {profile?.name}
            </Text>
            <Text style={[styles.username, {color: colors.textMuted}]}>
              {'@' + (profile?.name ?? 'user').toLowerCase().replace(/\s+/g, '_')}
            </Text>
            {profile?.bio ? (
              <Text style={[styles.bio, {color: colors.textSecondary}]}>
                {profile.bio}
              </Text>
            ) : null}

            <Text style={[styles.mutual, {color: colors.textMuted}]}>
              ◉ Followed by others you know
            </Text>

            <View style={[styles.statsRow, {borderColor: colors.border}]}>
              {[
                {label: 'Posts', value: userPosts.length},
                {label: 'Followers', value: 0},
                {label: 'Following', value: 0},
              ].map((stat, i) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statItem,
                    i < 2
                      ? {
                          borderRightColor: colors.border,
                          borderRightWidth: StyleSheet.hairlineWidth,
                        }
                      : null,
                  ]}>
                  <Text style={[styles.statCount, {color: colors.textPrimary}]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, {color: colors.textMuted}]}>
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.actionRow}>
              <AnimatedFollowButton
                following={following}
                onPress={() => setFollowing(f => !f)}
              />
              <Pressable
                onPress={() => hapticLight()}
                style={({pressed}) => [
                  styles.messageBtn,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}>
                <AppIcon color={colors.textSecondary} name="messageDm" size="action" />
                <Text style={[styles.messageBtnText, {color: colors.textPrimary}]}>
                  Message
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({item}) => (
          <PostCard
            onAuthorPress={userId => navigation.push('UserProfile', {userId})}
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
    width: '100%',
  },
  backArrow: {fontSize: 22},
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
  container: {flex: 1},
  content: {paddingBottom: 100},
  displayName: {fontSize: 22, fontWeight: '700', marginTop: 12, textAlign: 'center'},
  followBtn: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
    paddingVertical: 11,
    position: 'relative',
  },
  followBtnText: {fontSize: 14, fontWeight: '600', zIndex: 2},
  followBtnWrap: {flex: 1},
  followFill: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  loading: {alignItems: 'center', flex: 1, justifyContent: 'center'},
  messageBtn: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 11,
  },
  messageBtnText: {fontSize: 14, fontWeight: '600'},
  moreBtn: {padding: 8},
  moreIcon: {fontSize: 20},
  mutual: {fontSize: 12, marginTop: 8},
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statCount: {fontSize: 20, fontWeight: '700', textAlign: 'center'},
  statItem: {alignItems: 'center', flex: 1, paddingVertical: 14},
  statLabel: {fontSize: 12, marginTop: 2, textAlign: 'center'},
  statsRow: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    marginTop: 16,
    overflow: 'hidden',
    width: '100%',
  },
  topBar: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  topTitle: {flex: 1, fontSize: 17, fontWeight: '600', marginHorizontal: 12, textAlign: 'center'},
  username: {fontSize: 14, marginTop: 2},
});
