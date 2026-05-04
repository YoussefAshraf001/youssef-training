// Official Imports
import { useState } from "react";
import toast from "react-hot-toast";
import { mutate } from "swr";

// Custom Imports
import defaultavatar from "../../assets/default-avatar.svg";
import { useAuthStore } from "../../store/AuthStore";

function CommentSection({ article }: any) {
  const [comment, setComment] = useState("");
  const token = useAuthStore((state) => state.token);
  const encodedSlug = encodeURIComponent(article.slug);

  const commentsKey = [
    `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodedSlug}/comments`,
    token,
  ];

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!comment.trim()) return;

    if (!token) {
      toast.error("You must be signed in to post a comment.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodedSlug}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({
            comment: { body: comment },
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
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

      await mutate(
        commentsKey,
        (prev: any) => {
          if (!prev) return prev;

          return {
            ...prev,
            comments: [data.comment, ...prev.comments],
          };
        },
        false,
      );

      toast.success("Comment posted successfully!");
      setComment("");

      await mutate(commentsKey);
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Unable to post comment.");
    }
  };

  const handleChange = (e: any) => {
    setComment(e.target.value);
  };

  return (
    <div className="rounded-xl border border-zinc-300">
      <textarea
        name="comment"
        placeholder="Write a comment..."
        rows={5}
        value={comment || ""}
        onChange={handleChange}
        className="border border-zinc-300 rounded-t-xl w-156 min-h-13 pl-6 pt-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
      />

      <div className="flex justify-between py-2 px-4 bg-zinc-200 rounded-b-xl">
        <img
          src={article.author.image || defaultavatar.src}
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
  );
}

export default CommentSection;
