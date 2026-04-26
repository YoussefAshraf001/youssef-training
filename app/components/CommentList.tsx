import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { Comment } from "../types/Articles";
import { useAuthStore } from "../store/AuthStore";
import ConfirmModal from "./ConfirmModal";
import { RiDeleteBin6Line } from "react-icons/ri";

interface CommentListProps {
  slug: string;
  currentUser?: string;
  refreshTrigger?: number;
}

function CommentList({ slug, currentUser, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editBlocked, setEditBlocked] = useState(false);
  const token = useAuthStore((state) => state.token);
  const encodedSlug = encodeURIComponent(slug);

  useEffect(() => {
    fetchComments();
  }, [encodedSlug, refreshTrigger, token]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodedSlug}/comments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Token ${token}` } : {}),
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch comments");
      }

      const data = await res.json();
      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async () => {
    if (!deleteCommentId) return;

    try {
      setDeleting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodedSlug}/comments/${deleteCommentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Token ${token}` }),
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      // Remove the deleted comment from the state
      setComments(comments.filter((comment) => comment.id !== deleteCommentId));
      setDeleteCommentId(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-4">Loading comments...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="my-8">
      <h3 className="text-xl font-semibold mb-4">
        Comments ({comments.length})
      </h3>
      {comments.length === 0 ? (
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
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteCommentId(comment.id)}
                        className="text-zinc-500 hover:text-zinc-700 text-sm cursor-pointer"
                      >
                        <RiDeleteBin6Line />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
      <AnimatePresence>
        {editBlocked && (
          <ConfirmModal
            open={true}
            onCancel={() => setEditBlocked(false)}
            title="Feature unavailable"
            message="Editing comments is currently disabled due to API limitations."
            cancelText="Close"
            variant="info"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CommentList;
