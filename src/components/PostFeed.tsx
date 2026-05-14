import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import EmptyState from './EmptyState';
import {PostCardShimmer} from './LoadingShimmer';
import PostCard from './PostCard';
import StoryRow from './StoryRow';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {likesHydrated, togglePostLike} from '../store/slices/likesSlice';
import {fetchPosts} from '../store/slices/postsSlice';
import {useTheme} from '../theme/ThemeContext';
import type {Post} from '../types/social';
import type {RootStackParamList} from '../types/navigation';

type PostFeedProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export default React.memo(function PostFeed({navigation}: PostFeedProps): React.JSX.Element {
  const {colors} = useTheme();
  const dispatch = useAppDispatch();
  const likesByPostId = useAppSelector(state => state.likes.byPostId);
  const posts = useAppSelector(state => state.posts.items);
  const status = useAppSelector(state => state.posts.status);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hydrateLikes = useCallback(
    (items: Post[]) => {
      dispatch(
        likesHydrated(
          items.reduce<Record<string, {likedByMe: boolean; likeCount: number}>>(
            (acc, post) => {
              acc[post.id] = {likedByMe: post.likedByMe, likeCount: post.likeCount};
              return acc;
            },
            {},
          ),
        ),
      );
    },
    [dispatch],
  );

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPosts()).unwrap().then(hydrateLikes).catch(() => undefined);
    }
  }, [dispatch, hydrateLikes, status]);

  const mergedPosts = useMemo(
    () =>
      posts.map(post => ({
        ...post,
        likedByMe: likesByPostId[post.id]?.likedByMe ?? post.likedByMe,
        likeCount: likesByPostId[post.id]?.likeCount ?? post.likeCount,
      })),
    [likesByPostId, posts],
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const nextPosts = await dispatch(fetchPosts()).unwrap();
      hydrateLikes(nextPosts);
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch, hydrateLikes]);

  const handleToggleLike = useCallback(
    (postId: string) => dispatch(togglePostLike(postId)),
    [dispatch],
  );

  const handleAuthorPress = useCallback(
    (userId: string) => navigation.navigate('UserProfile', {userId}),
    [navigation],
  );

  const handleCommentPress = useCallback(
    (postId: string) => navigation.navigate('Comments', {postId}),
    [navigation],
  );

  if (status === 'loading' && !posts.length) {
    return (
      <View style={[styles.container, {backgroundColor: colors.background}]}>
        <StoryRow />
        <PostCardShimmer />
        <PostCardShimmer />
        <PostCardShimmer />
      </View>
    );
  }

  if (status === 'failed' && !posts.length) {
    return (
      <View style={[styles.centered, {backgroundColor: colors.background}]}>
        <EmptyState
          ctaLabel="Try again"
          heading="Could not load posts"
          illustration="⚠"
          onCta={handleRefresh}
          subtext="Pull down to refresh or tap below."
        />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={[
        styles.content,
        {backgroundColor: colors.background},
      ]}
      data={mergedPosts}
      keyExtractor={item => item.id}
      ListEmptyComponent={
        <EmptyState
          ctaLabel="Discover People"
          heading="Nothing here yet"
          illustration="◯"
          onCta={() => undefined}
          subtext="Follow people to see their posts in your feed."
        />
      }
      ListHeaderComponent={
        <>
          <StoryRow />
          <View style={styles.feedHeader} />
        </>
      }
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
      renderItem={({item}) => (
        <PostCard
          onAuthorPress={handleAuthorPress}
          onCommentPress={handleCommentPress}
          onToggleLike={handleToggleLike}
          post={item}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  centered: {flex: 1, justifyContent: 'center'},
  container: {flex: 1},
  content: {paddingBottom: 100},
  feedHeader: {height: 8},
});
