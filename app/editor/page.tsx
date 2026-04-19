"use client";

import { useState } from "react";
import { useAuthStore } from "../store";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Editor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);
  const [form, setForm] = useState({
    title: "",
    description: "",
    body: "",
    tags: [],
  });

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const token = useAuthStore.getState().token;

    try {
      const article: any = {
        article: {
          title: form.title,
          description: form.description,
          body: form.body,
        },
      };

      // Optional fields: tagList
      if (form.tags && form.tags.length > 0) {
        article.article.tagList = Array.isArray(form.tags)
          ? form.tags
          : form.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean);
      }

      const body = article;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/articles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : "Update failed";
        toast.error(errorMsg);
        return;
      }

      setToken(data.user.token);
      toast.success("Article Posted", {
        icon: "✅",
      });
      router.push(`/profile/${data.user.username}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center mt-10 pb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <input
            name="title"
            placeholder="Article Title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-150 h-13 pl-6 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Bio */}
          <input
            name="description"
            placeholder="What's this article about?"
            value={form.description}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-150 h-13 pl-6 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Email */}
          <textarea
            name="body"
            placeholder="Write your article (in markdown)"
            rows={5}
            value={form.body}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-150 min-h-13 pl-6 pt-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            name="tags"
            placeholder="Enter tags"
            type="tags"
            value={form.tags}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-150 h-13 pl-6 pt-0.5 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`w-36 h-14 rounded-lg text-xl text-white transition cursor-pointer ${
                loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-gray-400 rounded-full animate-spin"></div>
              ) : (
                "Publish Article"
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
