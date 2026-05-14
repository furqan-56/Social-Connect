export type UserProfile = {
  bio: string;
  id: string;
  name: string;
  photoUri?: string;
  updatedAt: string;
};

export type Comment = {
  authorName: string;
  createdAt: string;
  id: string;
  text: string;
};

export type Post = {
  authorAvatarUri?: string;
  authorId: string;
  authorName: string;
  comments: Comment[];
  createdAt: string;
  id: string;
  imageUri?: string;
  likedByMe: boolean;
  likeCount: number;
  text: string;
};
