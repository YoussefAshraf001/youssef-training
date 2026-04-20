type Author = {
  username: string;
  image: string | null;
  following: boolean;
};

export type Article = {
  slug: string;
  title: string;
  description: string;
  body: string;
  createdAt: string;
  favorited: boolean;
  favoritesCount: number;
  tagList: string[];
  author: Author;
};

export type ArticlesResponse = {
  articles: Article[];
  articlesCount: number;
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
