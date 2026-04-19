export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: string;
  favoritesCount: number;
  tagList: string[];
  author: {
    username: string;
    image: string | null;
  };
};

export type Comment = {
  id: number;
  body: string;
  createdAt: string;
  author: {
    username: string;
    image: string | null;
  };
};

export type CommentsResponse = {
  comments: Comment[];
};
