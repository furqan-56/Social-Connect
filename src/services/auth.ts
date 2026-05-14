import {auth, firestore} from '../config/firebase';
import type {UserProfile} from '../types/social';

export type SignUpPayload = {
  email: string;
  name: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const socialAuth = {
  async signUp({email, name, password}: SignUpPayload): Promise<{name: string}> {
    const {user} = await auth().createUserWithEmailAndPassword(email.trim(), password);

    const profile: UserProfile = {
      bio: '',
      id: user.uid,
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };

    await firestore().collection('users').doc(user.uid).set(profile);

    return {name: profile.name};
  },

  async login({email, password}: LoginPayload): Promise<void> {
    await auth().signInWithEmailAndPassword(email.trim(), password);
  },

  async logout(): Promise<void> {
    await auth().signOut();
  },

  async resetPassword(email: string): Promise<{email: string}> {
    const trimmed = email.trim().toLowerCase();
    await auth().sendPasswordResetEmail(trimmed);
    return {email: trimmed};
  },
};
