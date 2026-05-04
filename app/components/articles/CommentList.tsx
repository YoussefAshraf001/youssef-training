"use client";

// Official Imports
import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import useSWR from "swr";

// Custom Imports
import { Comment } from "../../types/Articles";
import { useAuthStore } from "../../store/AuthStore";
import ConfirmModal from "../ui/ConfirmModal/ConfirmModal";
import { fetcher } from "../../lib/fetcher";

interface CommentListProps {
  slug: string;
  currentUser?: string;
  refreshTrigger?: number;
}

type CommentsResponse = {
  comments: Comment[];
};

function CommentList({ slug, currentUser }: CommentListProps) {
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const token = useAuthStore((state) => state.token);
  const isLoggedIn = !!token;
  const encodedSlug = encodeURIComponent(slug);

  const getKey = () => {
    if (!slug) return null;

    return [
      `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodedSlug}/comments`,
      token,
    ];
  };

  const { data, error, isLoading, mutate } = useSWR<CommentsResponse>(
    getKey,
    fetcher,
  );

  const comments = data?.comments ?? [];

  const deleteComment = async () => {
    if (!deleteCommentId) return;

    try {
      setDeleting(true);

      await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodedSlug}/comments/${deleteCommentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Token ${token}` }),
          },
        },
      );

      await mutate((prev: any) => {
        if (!prev) return prev;

        return {
          ...prev,
          comments: prev.comments.filter((c: any) => c.id !== deleteCommentId),
        };
      }, false);

      setDeleteCommentId(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
    } finally {
      setDeleting(false);
    }
  };

  const showEmpty = comments.length === 0;

  if (isLoading) {
    return <div className="p-4">Loading comments...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error.message || "Failed to load comments"}
      </div>
    );
  }

  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">
        Comments ({comments.length})
      </h3>

      {!isLoggedIn && (
        <p className="mb-6 text-lg text-zinc-500 gap-1 flex items-center">
          <a href="/signin" className="text-green-600 hover:text-green-700">
            Sign In
          </a>
          or
          <a href="/register" className="text-green-600 hover:text-green-700">
            Sign Up
          </a>
          to add comments on this article.
        </p>
      )}

      {showEmpty ? (
        <p className="text-zinc-500">No comments yet.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-zinc-200 rounded-3xl shadow-sm p-5"
            >
              <p className="text-zinc-900 text-base leading-7">
                {comment.body}
              </p>

              <div className="mt-5 w-full rounded-full bg-zinc-100 px-6 py-3 text-zinc-500 text-sm">
                <div className="flex w-full items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.author.image || ""}
                      alt={comment.author.username}
                      className="h-8 w-8 rounded-full"
                    />

                    <Link
                      href={`/profile/${comment.author.username}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      {comment.author.username}
                    </Link>

                    <span className="whitespace-nowrap">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {currentUser === comment.author.username && (
                    <button
                      onClick={() => setDeleteCommentId(comment.id)}
                      className="text-zinc-500 hover:text-zinc-700 text-sm cursor-pointer"
                    >
                      <RiDeleteBin6Line />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteCommentId && (
          <ConfirmModal
            open={!!deleteCommentId}
            onCancel={() => setDeleteCommentId(null)}
            onConfirm={deleteComment}
            loading={deleting}
            title="Delete comment?"
            message="This will permanently remove the comment."
            confirmText="Delete"
            loadingText="Deleting..."
            variant="danger"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CommentList;
