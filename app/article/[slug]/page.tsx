"use client";

// Official imports
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { IoMdAdd } from "react-icons/io";
import { FaHeart, FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Custom imports
import { Article } from "../../types/Articles";
import CommentSection from "@/app/components/CommentSection";
import { useUser } from "../../hooks/useUser";
import { useAuthStore } from "../../store/AuthStore";
import CommentList from "@/app/components/CommentList";
import ConfirmModal from "@/app/components/ConfirmModal";

function Page() {
  const params = useParams();
  const router = useRouter();
  const slug = decodeURIComponent(params?.slug as string);
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { data: user } = useUser();
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!slug) return;

    const handleDataFetch = async () => {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodeURIComponent(slug)}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Failed response:", res.status, res.statusText);
          console.error("Error body:", errorText);
          throw new Error("Failed to fetch article");
        }

        const data = await res.json();
        const { article: articleData } = data;
        setArticle(articleData);
        // console.log(articleData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    handleDataFetch();
  }, [slug, token]);

  const handleFavoriteArticle = async () => {
    if (!article) return;

    if (!token) {
      toast("You must be logged in to like articles.", { icon: "⚠️" });
      return;
    }

    try {
      const method = article.favorited ? "DELETE" : "POST";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodeURIComponent(slug)}/favorite`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update favorite status");
      }

      setArticle(data.article);
    } catch (err) {
      console.error("Error toggling favorite:", err);
      toast.error("Could not update favorite status");
    }
  };

  const handleDeleteArticle = async () => {
    if (!token) {
      toast.error("You must be signed in to delete articles.");
      return;
    }

    try {
      setDeleting(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete article");
      }

      setDeleteOpen(false);
      toast.success("Article deleted");
      router.push("/");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Could not delete article");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <>
        <motion.div
          className="flex items-center justify-center p-6 h-full animate-pulse text-zinc-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="h-7 w-7 rounded-full border-t-2 animate-spin" />
        </motion.div>
      </>
    );
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!article) return <div className="p-6">Article not found</div>;

  const isOwnArticle = user?.username === article.author.username;

  return (
    <>
      <motion.div
        className="mt-6 w-full max-w-2xl mx-auto px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-[40px] font-semibold mb-4">{article?.title}</h2>
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <img
              src={article.author.image || ""}
              alt={article.author.username}
              className="h-7 w-7 rounded-full"
            />
            <div>
              <p>{article.author.username}</p>
              <p className="text-zinc-300 text-xs">
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-2 pl-5">
              {isOwnArticle ? (
                <>
                  <button
                    onClick={() =>
                      router.push(
                        `/editor?slug=${encodeURIComponent(article.slug)}`,
                      )
                    }
                    className="h-6 w-25 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
                  >
                    <MdEdit /> Edit Article
                  </button>
                  <button
                    onClick={() => setDeleteOpen(true)}
                    className="h-6 w-31 text-sm text-red-700 opacity-60 hover:opacity-100 hover:text-white flex justify-center items-center gap-1 border border-red-300 hover:bg-red-800 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
                  >
                    <MdDeleteOutline /> Delete Article
                  </button>
                </>
              ) : (
                <button className="h-6 w-31 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-300 rounded-md transition-all ease-in-out duration-200 cursor-pointer">
                  <IoMdAdd /> Follow {article.author.username}
                </button>
              )}
              {!isOwnArticle && (
                <button
                  onClick={handleFavoriteArticle}
                  className={`h-6 w-35 text-sm flex justify-center items-center gap-1 border rounded-md transition-all ease-in-out duration-200 cursor-pointer ${
                    article.favorited
                      ? "bg-green-500 text-white border-green-500"
                      : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
                  }`}
                >
                  <FaHeart /> Favorite Article ({article.favoritesCount})
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 prose prose-invert max-w-none">
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2 className="text-2xl mt-6 mb-3 pb-2">{children}</h2>
              ),
              p: ({ children }) => (
                <p className="text-lg leading-relaxed">{children}</p>
              ),
            }}
          >
            {article.body}
          </ReactMarkdown>
        </div>
        <div className="my-6 flex flex-wrap gap-2">
          {article.tagList.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 text-zinc-400 text-sm rounded-full border border-zinc-200"
            >
              {tag}
            </span>
          ))}
        </div>
        <hr />
        <div className="flex justify-center items-center gap-2 py-4">
          <img
            src={article.author.image || ""}
            alt={article.author.username}
            className="h-7 w-7 rounded-full"
          />
          <div>
            <p className="text-green-600 hover:underline cursor-pointer">
              {article.author.username}
            </p>
            <p className="text-zinc-300 text-xs">
              {new Date(article.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex gap-2 pl-5">
            {isOwnArticle ? (
              <>
                <button
                  onClick={() =>
                    router.push(
                      `/editor?slug=${encodeURIComponent(article.slug)}`,
                    )
                  }
                  className="h-6 w-25 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
                >
                  <FaRegEdit /> Edit Article
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="h-6 w-31 text-sm text-red-600 hover:text-white flex justify-center items-center gap-1 border border-red-400 hover:bg-red-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
                >
                  <MdDeleteOutline /> Delete Article
                </button>
              </>
            ) : (
              <button className="h-6 w-31 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-300 rounded-md transition-all ease-in-out duration-200 cursor-pointer">
                <IoMdAdd /> Follow {article.author.username}
              </button>
            )}
            {!isOwnArticle && (
              <button
                onClick={handleFavoriteArticle}
                className={`h-6 w-35 text-sm flex justify-center items-center gap-1 border rounded-md transition-all ease-in-out duration-200 cursor-pointer ${
                  article.favorited
                    ? "bg-green-500 text-white border-green-500"
                    : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
                }`}
              >
                <FaHeart /> Favorite Article ({article.favoritesCount})
              </button>
            )}
          </div>
        </div>
        <CommentSection
          article={article}
          onCommentPosted={() => setCommentRefresh((prev) => prev + 1)}
        />
        <CommentList
          slug={slug}
          currentUser={user?.username}
          refreshTrigger={commentRefresh}
        />
        <AnimatePresence>
          {deleteOpen && (
            <ConfirmModal
              open={deleteOpen}
              onCancel={() => setDeleteOpen(false)}
              onConfirm={handleDeleteArticle}
              loading={deleting}
              title="Delete article?"
              message="This will permanently remove the article."
              confirmText="Delete"
              loadingText="Deleting..."
              variant="danger"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default Page;
