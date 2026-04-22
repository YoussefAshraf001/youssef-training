"use client";

//Official Imports
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

//Custom Imports
import logo from "./assets/conduit-logo.svg";
import { Article } from "./types/Articles";
import { useAuthStore } from "./store/AuthStore";
import { useUser } from "./hooks/useUser";
import ConfirmModal from "./components/ConfirmModal";
import TagsSidebar from "./components/TagsSidebar";
import ArticleCard from "./components/ArticleCard";
import toast from "react-hot-toast";

export default function Home() {
  // ZUSTAND STORED USER DATA
  const { data: currentUser } = useUser();
  const token = useAuthStore((state) => state.token);
  const isLoggedIn = !!token;

  // MAIN STATES
  const [tab, setTab] = useState("Global Feed");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  // HOVER STATES (for showing follow/edit/delete buttons)
  const [hoveredAuthor, setHoveredAuthor] = useState<string | null>(null);
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editBlocked, setEditBlocked] = useState(false);

  // TAG FILTER STATE
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // PAGINATION STATES
  const [page, setPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const limit = 3;
  const totalPages = Math.ceil(totalArticles / limit);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;

      let url = "";

      if (tab === "Your Feed") {
        url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles/feed?limit=${limit}&offset=${offset}`;
      } else if (selectedTag) {
        url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles?tag=${selectedTag}&limit=${limit}&offset=${offset}`;
      } else {
        url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles?limit=${limit}&offset=${offset}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const data = await res.json();
      setArticles(data.articles || []);
      setTotalArticles(data.articlesCount || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [tab, page, token, selectedTag]);

  useEffect(() => {
    setPage(1);
  }, [tab, selectedTag]);

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, [page]);

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

      setArticles((prev) =>
        prev.map((a) => (a.slug === article.slug ? data.article : a)),
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleFollow = async (author: any) => {
    if (!isLoggedIn) {
      toast("You must be logged in to follow users.", { icon: "⚠️" });
      return;
    }

    try {
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

      setArticles((prev) =>
        prev.map((article) =>
          article.author.username === author.username
            ? { ...article, author: data.profile }
            : article,
        ),
      );

      if (tab === "Your Feed" && author.following) {
        setArticles((prev) =>
          prev.filter((a) => a.author.username !== author.username),
        );
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
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

      setArticles((prev) => prev.filter((a) => a.slug !== deleteSlug));

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
                className={`pb-2 ${
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
              className={`pb-2 ${
                tab === "Global Feed"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-zinc-400"
              }`}
            >
              Global Feed
            </button>
            {selectedTag && (
              <button className="pb-2 text-green-500 border-b-2 border-green-500">
                # {selectedTag}
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
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

          {/* Articles */}
          {!loading && (
            <motion.div
              className="flex flex-col gap-6 h-141"
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

              {articles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  currentUser={currentUser}
                  hoveredArticle={hoveredArticle}
                  hoveredAuthor={hoveredAuthor}
                  setHoveredArticle={setHoveredArticle}
                  setHoveredAuthor={setHoveredAuthor}
                  onLike={handleArticleLike}
                  onFollow={handleFollow}
                  onDelete={(slug) => setDeleteSlug(slug)}
                  onEditBlocked={() => setEditBlocked(true)}
                />
              ))}
            </motion.div>
          )}

          <div className="flex justify-center gap-2 pt-15 pb-4">
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
      <AnimatePresence>
        {editBlocked && (
          <ConfirmModal
            open={true}
            onCancel={() => setEditBlocked(false)}
            onConfirm={() => setEditBlocked(false)}
            title="Feature unavailable"
            message="This feature is currently disabled due to API limitations."
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
