import toast from "react-hot-toast";

import type { Article } from "../types/Articles";

type Author = Article["author"];
type Tab = "Global Feed" | "Your Feed" | "Tag";

export function useArticleActions(
  token: string | null,
  isLoggedIn: boolean,
  mutate: any,
) {
  const favorite = async (article: Article, slug: string) => {
    if (!isLoggedIn || !token) return;

    const method = article.favorited ? "DELETE" : "POST";

    const optimistic = {
      ...article,
      favorited: !article.favorited,
      favoritesCount: article.favorited
        ? article.favoritesCount - 1
        : article.favoritesCount + 1,
    };

    mutate((prev: any) => ({ ...prev, article: optimistic }), false);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${slug}/favorite`,
        {
          method,
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error();

      mutate({ article: data.article }, false);
      toast.success(
        article.favorited ? "Article unfavorited" : "Article favorited",
      );
    } catch {
      toast.error("Favorite action failed");
    }
  };

  const follow = async (author: Author, tab?: Tab) => {
    if (!isLoggedIn || !token) return;

    const method = author.following ? "DELETE" : "POST";

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ROOT}/profiles/${author.username}/follow`,
      {
        method,
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    const data = await res.json();

    mutate((prev: any) => {
      if (!prev) return prev;

      // 🔹 Feed page
      if (prev.articles) {
        // 👉 ONLY remove in "Your Feed"
        if (tab === "Your Feed" && author.following) {
          return {
            ...prev,
            articles: prev.articles.filter(
              (a: any) => a.author.username !== author.username,
            ),
          };
        }

        // otherwise just update author
        return {
          ...prev,
          articles: prev.articles.map((a: any) =>
            a.author.username === author.username
              ? { ...a, author: data.profile }
              : a,
          ),
        };
      }

      // 🔹 Article page
      if (prev.article) {
        return {
          ...prev,
          article: {
            ...prev.article,
            author: data.profile,
          },
        };
      }

      return prev;
    }, false);
  };

  const deleteArticle = async (slug: string) => {
    if (!token) return false;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${slug}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );

    if (res.ok) {
      toast.success("Article deleted");
    } else {
      toast.error("Delete failed");
    }

    return res.ok;
  };

  return { favorite, follow, deleteArticle };
}
