import {PayloadAction, createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {postsService} from '../../services/posts';
import type {RootState} from '../store';
import {postLikeChanged} from './postsSlice';

export type PostLikeState = {
  likedByMe: boolean;
  likeCount: number;
};

export type LikesState = {
  byPostId: Record<string, PostLikeState>;
};

const initialState: LikesState = {
  byPostId: {},
};

export const togglePostLike = createAsyncThunk(
  'likes/togglePostLike',
  async (postId: string, {dispatch, getState}) => {
    const state = getState() as RootState;
    const current = state.likes.byPostId[postId];
    const updatedPost = await postsService.toggleLike(postId);

    const nextLikeState = updatedPost
      ? {
          likedByMe: updatedPost.likedByMe,
          likeCount: updatedPost.likeCount,
        }
      : {
          likedByMe: !current?.likedByMe,
          likeCount: current?.likedByMe
            ? Math.max((current?.likeCount ?? 1) - 1, 0)
            : (current?.likeCount ?? 0) + 1,
        };

    dispatch(postLikeChanged({postId, ...nextLikeState}));

    return {
      postId,
      ...nextLikeState,
    };
  },
);

const likesSlice = createSlice({
  initialState,
  name: 'likes',
  reducers: {
    likesHydrated(
      state,
      action: PayloadAction<Record<string, PostLikeState>>,
    ) {
      state.byPostId = action.payload;
    },
    realtimeLikeReceived(
      state,
      action: PayloadAction<{likedByMe?: boolean; likeCount: number; postId: string}>,
    ) {
      const current = state.byPostId[action.payload.postId];

      state.byPostId[action.payload.postId] = {
        likedByMe: action.payload.likedByMe ?? current?.likedByMe ?? false,
        likeCount: action.payload.likeCount,
      };
    },
  },
  extraReducers: builder => {
    builder.addCase(togglePostLike.fulfilled, (state, action) => {
      state.byPostId[action.payload.postId] = {
        likedByMe: action.payload.likedByMe,
        likeCount: action.payload.likeCount,
      };
    });
  },
});

export const {likesHydrated, realtimeLikeReceived} = likesSlice.actions;
export default likesSlice.reducer;
