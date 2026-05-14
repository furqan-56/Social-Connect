import {
  PayloadAction,
  createAsyncThunk,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit';
import {postsService} from '../../services/posts';
import type {RootState} from '../store';
import type {Comment, Post} from '../../types/social';

export type PostsState = {
  items: Post[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

const initialState: PostsState = {
  items: [],
  status: 'idle',
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, {getState}) => {
    const state = getState() as RootState;
    return postsService.fetchPosts(state.auth.user?.id);
  },
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (payload: {imageUri?: string; text: string}, {getState}) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    if (!user) throw new Error('Not authenticated.');
    return postsService.createPost(payload, user);
  },
);

export const addComment = createAsyncThunk(
  'posts/addComment',
  async (payload: {postId: string; text: string}, {getState}) => {
    const state = getState() as RootState;
    const user = state.auth.user;
    if (!user) throw new Error('Not authenticated.');
    return postsService.addComment(payload, user);
  },
);

export const fetchComments = createAsyncThunk(
  'posts/fetchComments',
  async (postId: string) => {
    const comments = await postsService.fetchComments(postId);
    return {comments, postId};
  },
);

const postsSlice = createSlice({
  initialState,
  name: 'posts',
  reducers: {
    commentReceived(
      state,
      action: PayloadAction<{comment: Comment; postId: string}>,
    ) {
      const post = state.items.find(item => item.id === action.payload.postId);
      if (post) {
        post.comments.push(action.payload.comment);
      }
    },
    likeReceived(
      state,
      action: PayloadAction<{
        likedByMe?: boolean;
        likeCount: number;
        postId: string;
      }>,
    ) {
      const post = state.items.find(item => item.id === action.payload.postId);
      if (post) {
        post.likeCount = action.payload.likeCount;
        post.likedByMe = action.payload.likedByMe ?? post.likedByMe;
      }
    },
    optimisticPostAdded: {
      prepare(text: string) {
        return {
          payload: {
            authorId: 'current-user',
            authorName: 'Social Member',
            comments: [],
            createdAt: new Date().toISOString(),
            id: nanoid(),
            likedByMe: false,
            likeCount: 0,
            text,
          } satisfies Post,
        };
      },
      reducer(state, action: PayloadAction<Post>) {
        state.items.unshift(action.payload);
      },
    },
    postLikeChanged(
      state,
      action: PayloadAction<{likedByMe: boolean; likeCount: number; postId: string}>,
    ) {
      const post = state.items.find(item => item.id === action.payload.postId);
      if (post) {
        post.likedByMe = action.payload.likedByMe;
        post.likeCount = action.payload.likeCount;
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPosts.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchPosts.rejected, state => {
        state.status = 'failed';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const post = state.items.find(item => item.id === action.meta.arg.postId);
        if (post) {
          post.comments.push(action.payload);
        }
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const post = state.items.find(item => item.id === action.payload.postId);
        if (post) {
          post.comments = action.payload.comments;
        }
      });
  },
});

export const {
  commentReceived,
  likeReceived,
  optimisticPostAdded,
  postLikeChanged,
} = postsSlice.actions;
export default postsSlice.reducer;
