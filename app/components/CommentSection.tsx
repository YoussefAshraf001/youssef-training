import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store";

function CommentSection({ article, onCommentPosted }: any) {
  const [comment, setComment] = useState("");
  const token = useAuthStore((state) => state.token);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!token) {
      toast.error("You must be signed in to post a comment.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${article.slug}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            comment: { body: comment, article: article._id },
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Comment API error:", res.status, data);
        const message = data?.errors
          ? Object.entries(data.errors)
              .map(
                ([key, value]) =>
                  `${key} ${Array.isArray(value) ? value.join(", ") : value}`,
              )
              .join("; ")
          : "Unable to post comment.";
        toast.error(message);
        return;
      }

      toast.success("Comment posted successfully!");
      setComment("");
      onCommentPosted?.();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Unable to post comment.");
    }
  };

  const handleChange = (e: any) => {
    setComment(e.target.value);
  };

  return (
    <>
      <div className="rounded-xl border border-zinc-300">
        <textarea
          name="comment"
          placeholder="Write a comment..."
          rows={5}
          value={comment || ""}
          onChange={handleChange}
          className="border border-zinc-300 rounded-t-xl w-156 min-h-13 pl-6 pt-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <div className="flex justify-between py-2 px-4 bg-zinc-200">
          <img
            src={article.author.image || ""}
            alt={article.author.username}
            className="h-7 w-7 rounded-full"
          />
          <button
            onClick={handleSubmit}
            className="h-6 w-35 text-sm text-green-600 hover:text-white flex justify-center items-center gap-1 border border-green-400 hover:bg-green-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
          >
            Post Comment
          </button>
        </div>
      </div>
    </>
  );
}

export default CommentSection;
