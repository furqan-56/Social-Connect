import {useEffect} from 'react';
import {connectSocket, disconnectSocket} from '../config/socialRealtime';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {realtimeLikeReceived} from '../store/slices/likesSlice';
import {commentReceived, likeReceived} from '../store/slices/postsSlice';
import type {Comment} from '../types/social';

type LikeEvent = {
  likedByMe?: boolean;
  likeCount: number;
  postId: string;
};

type CommentEvent = {
  comment: Comment;
  postId: string;
};

export function useRealtimeSync(): void {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(state => state.auth.user?.id);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const socket = connectSocket(userId);

    const handleLike = (data: LikeEvent) => {
      dispatch(likeReceived(data));
      dispatch(realtimeLikeReceived(data));
    };

    const handleComment = (data: CommentEvent) => {
      dispatch(commentReceived(data));
    };

    socket.on('like', handleLike);
    socket.on('comment', handleComment);

    return () => {
      socket.off('like', handleLike);
      socket.off('comment', handleComment);
      disconnectSocket();
    };
  }, [dispatch, userId]);
}
