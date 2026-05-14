import {auth, firestore} from '../config/firebase';
import type {UserProfile} from '../types/social';

function requireUid(): string {
  const uid = auth().currentUser?.uid;
  if (!uid) throw new Error('Not authenticated.');
  return uid;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const uid = requireUid();
    const doc = await firestore().collection('users').doc(uid).get();
    const data = doc.data() as UserProfile | undefined;

    return (
      data ?? {
        bio: '',
        id: uid,
        name: auth().currentUser?.displayName ?? 'Social Member',
        updatedAt: new Date().toISOString(),
      }
    );
  },

  async getPublicProfile(userId: string): Promise<UserProfile> {
    const doc = await firestore().collection('users').doc(userId).get();
    const data = doc.data() as UserProfile | undefined;

    return (
      data ?? {
        bio: 'Social Connect member.',
        id: userId,
        name: 'Social Member',
        updatedAt: new Date().toISOString(),
      }
    );
  },

  async saveProfile(
    profile: Pick<UserProfile, 'bio' | 'name' | 'photoUri'>,
  ): Promise<UserProfile> {
    const uid = requireUid();

    const updated: UserProfile = {
      bio: profile.bio.trim(),
      id: uid,
      name: profile.name.trim(),
      photoUri: profile.photoUri,
      updatedAt: new Date().toISOString(),
    };

    await firestore().collection('users').doc(uid).set(updated, {merge: true});

    return updated;
  },
};
