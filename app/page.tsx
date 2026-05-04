"use client";

// Official Imports
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "swr";

// Custom Imports
import logo from "./assets/conduit-logo.svg";
import { Article } from "./types/Articles";
import { useAuthStore } from "./store/AuthStore";
import { useUser } from "./hooks/useUser";
import ConfirmModal from "./components/ui/ConfirmModal/ConfirmModal";
import TagsSidebar from "./components/layout/TagsSidebar";
import ArticleCard from "./components/articles/ArticleCard/ArticleCard";
import { fetcher } from "./lib/fetcher";
import { useArticleActions } from "./hooks/useArticleActions";

type Tab = "Global Feed" | "Your Feed" | "Tag";

export default function Home() {
  const router = useRouter();

  // ZUSTAND STORED USER DATA
  const { user: currentUser } = useUser();
  const token = useAuthStore((state) => state.token);
  const isLoggedIn = !!token;

  // MAIN STATES

  const [tab, setTab] = useState<Tab>("Global Feed");

  // HOVER STATES (for showing follow/edit/delete buttons)
  const [hoveredAuthor, setHoveredAuthor] = useState<string | null>(null);
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // TAG FILTER STATE
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // PAGINATION STATES
  const [page, setPage] = useState(1);
  const limit = 3;

  const getKey = () => {
    const offset = (page - 1) * limit;

    // Prevent fetching "Your Feed" without token
    if (tab === "Your Feed" && !token) return null;

    let url = "";

    if (tab === "Your Feed") {
      url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles/feed?limit=${limit}&offset=${offset}`;
    } else if (selectedTag) {
      url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles?tag=${selectedTag}&limit=${limit}&offset=${offset}`;
    } else {
      url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles?limit=${limit}&offset=${offset}`;
    }

    return [url, token];
  };

  const { data, error, isLoading, mutate } = useSWR(getKey, fetcher);
  const { follow } = useArticleActions(token, isLoggedIn, mutate);

  // Derived states
  const articles = data?.articles ?? [];
  const totalArticles = data?.articlesCount ?? 0;
  const totalPages = Math.ceil(totalArticles / limit);

  useEffect(() => {
    setPage(1);
  }, [tab, selectedTag]);

  const handleArticleLike = async (article: Article) => {
    if (!isLoggedIn) {
      toast("You must be logged in to like articles.", { icon: "⚠️" });
      return;
    }
    try {
      const method = article.favorited ? "DELETE" : "POST";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${article.slug}/favorite`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );

      const data = await res.json();

      mutate(
        (prev: any) => ({
          ...prev,
          articles: prev.articles.map((a: any) =>
            a.slug === article.slug ? data.article : a,
          ),
        }),
        false,
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteSlug) return;

    setDeleting(true);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${deleteSlug}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      mutate(
        (prev: any) => ({
          ...prev,
          articles: prev.articles.filter((a: any) => a.slug !== deleteSlug),
        }),
        false,
      );

      setDeleteSlug(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col mt-10 px-4 lg:px-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <div className="flex flex-col items-center text-center mb-8">
        <Image
          src={logo}
          alt="Conduit logo"
          width={120}
          height={30}
          className="w-24 lg:w-52 pb-2"
        />
        <p className="text-zinc-300">
          This is the
          <a
            href="https://github.com/YoussefAshraf001/youssef-training"
            target="_blank"
            rel="noopener noreferrer"
            className="px-1 text-green-700 opacity-55 underline"
          >
            NEXT.JS frontend
          </a>
          demo from the
          <a
            href="https://github.com/realworld-apps/realworld"
            target="_blank"
            rel="noopener noreferrer"
            className="px-1 text-green-700 opacity-55 underline"
          >
            Realworld
          </a>
          project.
        </p>
        <p className="text-zinc-300">
          This demo is connected to a demo backend that enforces session
          isolation.
        </p>
      </div>

      {/* CONTENT */}
      <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* LEFT SIDE (FEED) */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6 text-sm">
            {isLoggedIn && (
              <button
                onClick={() => setTab("Your Feed")}
                className={`pb-2 cursor-pointer ${
                  tab === "Your Feed"
                    ? "text-green-500 border-b-2 border-green-500"
                    : "text-zinc-400"
                }`}
              >
                Your Feed
              </button>
            )}

            <button
              onClick={() => {
                setTab("Global Feed");
                setSelectedTag(null);
              }}
              className={`pb-2 cursor-pointer ${
                tab === "Global Feed"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-zinc-400"
              }`}
            >
              Global Feed
            </button>
            {selectedTag && (
              <button
                onClick={() => {
                  setTab("Tag");
                }}
                className="pb-2 cursor-pointer text-green-500 border-b-2 border-green-500"
              >
                # {selectedTag}
              </button>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <motion.div
              className="flex justify-center p-6 h-141 animate-pulse text-zinc-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="h-7 w-7 rounded-full border-t-2 animate-spin" />
            </motion.div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center py-6">
              Failed to load articles. Try refreshing.
            </div>
          )}

          {/* Articles */}
          {!isLoading && !error && (
            <motion.div
              className="flex flex-col gap-6 h-screen-70 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {articles.length === 0 && (
                <p className="text-sm text-zinc-400">
                  Your feed is empty. Follow some users to see their articles
                  here, or check out the
                  <a
                    className="pl-1 text-green-600"
                    onClick={() => setTab("Global Feed")}
                  >
                    Global Feed
                  </a>
                  !
                </p>
              )}

              {articles.map((article: any) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  currentUser={currentUser}
                  hoveredArticle={hoveredArticle}
                  hoveredAuthor={hoveredAuthor}
                  setHoveredArticle={setHoveredArticle}
                  setHoveredAuthor={setHoveredAuthor}
                  onLike={handleArticleLike}
                  onFollow={(author) => follow(author, tab)}
                  onDelete={(slug) => setDeleteSlug(slug)}
                  onEdit={(slug) =>
                    router.push(`/editor?slug=${encodeURIComponent(slug)}`)
                  }
                />
              ))}
            </motion.div>
          )}

          <div className="flex justify-center gap-2 py-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 border rounded ${
                  page === p
                    ? "bg-green-500 text-white border-green-500"
                    : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <hr className="text-zinc-200" />
        </div>

        {/* RIGHT SIDE (TAGS) */}
        <TagsSidebar
          selectedTag={selectedTag}
          onTagClick={(tag) => {
            setSelectedTag(tag);
            setTab("Tag");
          }}
        />
      </div>

      <AnimatePresence>
        {deleteSlug && (
          <ConfirmModal
            open={!!deleteSlug}
            onCancel={() => setDeleteSlug(null)}
            onConfirm={handleDelete}
            loading={deleting}
            title="Delete article?"
            message="This will permanently remove the article."
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
