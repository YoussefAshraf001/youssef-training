export type Article = {
  slug: string;
  title: string;
  description: string;
  createdAt: string;
  favoritesCount: number;
  tagList: string[];
  author: {
    username: string;
    image: string | null;
  };
};

export type ArticlesResponse = {
  articles: Article[];
};
