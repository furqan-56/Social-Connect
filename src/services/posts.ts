import type {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {auth, firestore} from '../config/firebase';
import type {Comment, Post} from '../types/social';

const POSTS = 'posts';
const COMMENTS = 'comments';

function toIso(ts: FirebaseFirestoreTypes.Timestamp | null | undefined): string {
  return ts?.toDate().toISOString() ?? new Date().toISOString();
}

function docToPost(
  doc: FirebaseFirestoreTypes.DocumentSnapshot,
  currentUserId?: string,
): Post {
  const data = doc.data();
  if (!data) throw new Error(`Post ${doc.id} has no data.`);
  const likedBy: string[] = data.likedBy ?? [];

  return {
    authorAvatarUri: data.authorAvatarUri ?? undefined,
    authorId: data.authorId,
    authorName: data.authorName,
    comments: [],
    createdAt: toIso(data.createdAt),
    id: doc.id,
    imageUri: data.imageUri ?? undefined,
    likedByMe: currentUserId ? likedBy.includes(currentUserId) : false,
    likeCount: data.likeCount ?? 0,
    text: data.text ?? '',
  };
}

function docToComment(doc: FirebaseFirestoreTypes.DocumentSnapshot): Comment {
  const data = doc.data();
  if (!data) throw new Error(`Comment ${doc.id} has no data.`);

  return {
    authorName: data.authorName,
    createdAt: toIso(data.createdAt),
    id: doc.id,
    text: data.text,
  };
}

export const postsService = {
  async fetchPosts(currentUserId?: string): Promise<Post[]> {
    const snap = await firestore()
      .collection(POSTS)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snap.docs.map(doc => docToPost(doc, currentUserId));
  },

  async fetchPostsByUser(userId: string, currentUserId?: string): Promise<Post[]> {
    const snap = await firestore()
      .collection(POSTS)
      .where('authorId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    return snap.docs.map(doc => docToPost(doc, currentUserId));
  },

  async createPost(
    payload: {imageUri?: string; text: string},
    user: {id: string; name: string; photoUri?: string},
  ): Promise<Post> {
    const ref = await firestore()
      .collection(POSTS)
      .add({
        authorAvatarUri: user.photoUri ?? null,
        authorId: user.id,
        authorName: user.name,
        createdAt: firestore.FieldValue.serverTimestamp(),
        imageUri: payload.imageUri ?? null,
        likedBy: [],
        likeCount: 0,
        text: payload.text.trim(),
      });

    const doc = await ref.get();
    return docToPost(doc, user.id);
  },

  async toggleLike(postId: string): Promise<Post | undefined> {
    const currentUserId = auth().currentUser?.uid;
    if (!currentUserId) return undefined;

    const postRef = firestore().collection(POSTS).doc(postId);

    return firestore().runTransaction(async tx => {
      const doc = await tx.get(postRef);
      if (!doc.exists) return undefined;

      const data = doc.data()!;
      const likedBy: string[] = data.likedBy ?? [];
      const isLiked = likedBy.includes(currentUserId);
      const nextLikedBy = isLiked
        ? likedBy.filter((id: string) => id !== currentUserId)
        : [...likedBy, currentUserId];

      tx.update(postRef, {likedBy: nextLikedBy, likeCount: nextLikedBy.length});

      return {
        authorAvatarUri: data.authorAvatarUri ?? undefined,
        authorId: data.authorId,
        authorName: data.authorName,
        comments: [],
        createdAt: toIso(data.createdAt),
        id: doc.id,
        imageUri: data.imageUri ?? undefined,
        likedByMe: !isLiked,
        likeCount: nextLikedBy.length,
        text: data.text ?? '',
      } satisfies Post;
    });
  },

  async fetchComments(postId: string): Promise<Comment[]> {
    const snap = await firestore()
      .collection(POSTS)
      .doc(postId)
      .collection(COMMENTS)
      .orderBy('createdAt', 'asc')
      .get();

    return snap.docs.map(docToComment);
  },

  async addComment(
    {postId, text}: {postId: string; text: string},
    user: {id: string; name: string},
  ): Promise<Comment> {
    const ref = await firestore()
      .collection(POSTS)
      .doc(postId)
      .collection(COMMENTS)
      .add({
        authorId: user.id,
        authorName: user.name,
        createdAt: firestore.FieldValue.serverTimestamp(),
        text: text.trim(),
      });

    return {
      authorName: user.name,
      createdAt: new Date().toISOString(),
      id: ref.id,
      text: text.trim(),
    };
  },
};
