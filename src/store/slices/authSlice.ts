import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import type {UserProfile} from '../../types/social';

export type AuthState = {
  isAuthenticated: boolean;
  user: UserProfile | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
};

const authSlice = createSlice({
  initialState,
  name: 'auth',
  reducers: {
    loginSucceeded(state, action: PayloadAction<UserProfile>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
    },
    profileUpdated(state, action: PayloadAction<UserProfile>) {
      state.user = action.payload;
    },
  },
});

export const {loginSucceeded, logout, profileUpdated} = authSlice.actions;
export default authSlice.reducer;
