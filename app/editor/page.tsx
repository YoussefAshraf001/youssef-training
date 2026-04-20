"use client";

import { useState } from "react";
import { useAuthStore } from "../store";
import { useUser } from "../hooks/useUser";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Form } from "../types/Form";
import { WithContext as ReactTags } from "react-tag-input";
import { Tag } from "react-tag-input";

export default function Editor() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: user } = useUser();
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState<Form>({
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

  const handleTagDelete = (i: number) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleTagAddition = (tag: Tag) => {
    setTags([...tags, tag]);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const token = useAuthStore.getState().token;

    if (!form.title || !form.description || !form.body) {
      toast.error("All fields are required");
      return;
    }

    try {
      const article: any = {
        article: {
          title: form.title,
          description: form.description,
          body: form.body,
        },
      };

      if (tags && tags.length > 0) {
        article.article.tagList = tags.map((tag) => tag.text);
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

      console.log("Submitting:", body);
      console.log("Token:", token);
      console.log("Status:", res.status);
      console.log("Response:", data);

      if (!res.ok || !data.article) {
        const errorMsg = data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : "Failed to create article";

        console.error("API ERROR:", data);
        toast.error(errorMsg);
        return;
      }

      toast.success("Article Posted", {
        icon: "✅",
      });
      router.push(`/profile/${user?.username}`);
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
          {/* Title */}
          <input
            name="title"
            placeholder="Article Title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-150 h-13 pl-6 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Description */}
          <input
            name="description"
            placeholder="What's this article about?"
            value={form.description}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-150 h-13 pl-6 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Body */}
          <textarea
            name="body"
            placeholder="Write your article (in markdown)"
            rows={5}
            value={form.body}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-150 min-h-13 pl-6 pt-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <ReactTags
            tags={tags}
            handleDelete={handleTagDelete}
            handleAddition={handleTagAddition}
            inputFieldPosition="top"
            autocomplete
            placeholder="Enter tags"
            classNames={{
              tagInputField:
                "border border-zinc-300 rounded-xl w-150 min-h-13 pl-6 text-lg focus:outline-none focus:ring-2 focus:ring-green-500",
              tag: "rounded-full bg-green-500 text-white px-3 py-1 mr-2 mb-2 inline-flex items-center",
              remove: "ml-2 cursor-pointer text-white hover:text-gray-200",
            }}
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
