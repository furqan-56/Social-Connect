import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import likesReducer from './slices/likesSlice';
import postsReducer from './slices/postsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    likes: likesReducer,
    posts: postsReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
