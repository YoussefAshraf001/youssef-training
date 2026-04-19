import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Comment } from "../types/Articles";
import { useAuthStore } from "../store";

interface CommentListProps {
  slug: string;
  currentUser?: string;
  refreshTrigger?: number;
}

function CommentList({ slug, currentUser, refreshTrigger }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchComments();
  }, [slug, refreshTrigger]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${slug}/comments`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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

  const deleteComment = async (commentId: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${slug}/comments/${commentId}`,
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
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
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
              <div className="mt-5 w-full rounded-2xl bg-zinc-100 px-4 py-3 text-zinc-500 text-sm">
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
                  </div>
                  <span className="whitespace-nowrap">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
              {currentUser === comment.author.username && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentList;
