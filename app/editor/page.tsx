"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Tag, WithContext as ReactTags } from "react-tag-input";
import { motion } from "framer-motion";

import { useAuthStore } from "../store/AuthStore";
import { Form } from "../types/Form";

function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem("auth-storage");

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as {
      state?: { token?: string | null };
    };

    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

export default function Editor() {
  const router = useRouter();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("slug");

  const token = useAuthStore((state) => state.token);

  const [loading, setLoading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [form, setForm] = useState<Form>({
    title: "",
    description: "",
    body: "",
    tags: [],
  });

  const isEditing = !!editSlug;

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

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = [...tags];

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    setTags(newTags);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (!form.title || !form.description || !form.body) {
      toast.error("All fields are required");
      setLoading(false);
      return;
    }

    if (!token) {
      toast.error("You must be signed in to publish articles.");
      setLoading(false);
      router.push("/signin");
      return;
    }

    try {
      const payload: any = {
        article: {
          title: form.title,
          description: form.description,
          body: form.body,
        },
      };

      if (tags.length > 0) {
        payload.article.tagList = tags.map((tag) => tag.text);
      }

      const endpoint = isEditing
        ? `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodeURIComponent(editSlug)}`
        : `${process.env.NEXT_PUBLIC_API_ROOT}/articles`;

      const res = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.article) {
        const errorMsg = data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : isEditing
            ? "Failed to update article"
            : "Failed to create article";

        console.error("API ERROR:", data);
        toast.error(errorMsg);
        return;
      }

      toast.success(isEditing ? "Article updated" : "Article posted", {
        icon: "✅",
      });
      router.push(`/article/${data.article.slug}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!editSlug) return;

    const authToken = token ?? readStoredToken();

    if (!authToken) {
      toast.error("You must be signed in to edit articles.");
      router.push("/signin");
      return;
    }

    const loadArticle = async () => {
      try {
        setLoadingArticle(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${encodeURIComponent(editSlug)}`,
          {
            headers: {
              Authorization: `Token ${authToken}`,
            },
          },
        );

        const data = await res.json();

        if (!res.ok || !data.article) {
          throw new Error("Failed to load article");
        }

        setForm({
          title: data.article.title,
          description: data.article.description,
          body: data.article.body,
          tags: data.article.tagList,
        });

        setTags(
          data.article.tagList.map((tag: any) => ({
            id: tag,
            text: tag,
          })),
        );
      } catch (err) {
        console.error(err);
        toast.error("Could not load article for editing");
        router.push("/");
      } finally {
        setLoadingArticle(false);
      }
    };

    loadArticle();
  }, [editSlug, token]);
  return (
    <motion.div
      className="flex justify-center mt-10 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      {loadingArticle ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-4 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-2xl px-4"
        >
          <input
            ref={titleInputRef}
            name="title"
            placeholder="Article Title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-full h-12 pl-6 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <input
            name="description"
            placeholder="What's this article about?"
            value={form.description}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-full h-12 pl-6 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <textarea
            name="body"
            placeholder="Write your article (in markdown)"
            rows={5}
            value={form.body}
            onChange={handleChange}
            className="border border-zinc-300 rounded-xl w-full min-h-12 pl-6 pt-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <ReactTags
            tags={tags}
            handleDelete={handleTagDelete}
            handleAddition={handleTagAddition}
            inputFieldPosition="top"
            autocomplete
            placeholder="Enter tags"
            handleDrag={handleDrag}
            allowDragDrop
            classNames={{
              tagInput: "mb-3",
              tagInputField:
                "border border-zinc-300 rounded-xl w-full min-h-12 pl-6 text-lg focus:outline-none focus:ring-2 focus:ring-green-500",
              tag: "rounded-full bg-green-500 text-white px-3 py-1 mr-2 mb-2 inline-flex items-center",
              remove: "ml-2 cursor-pointer text-white hover:text-gray-200",
            }}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`w-36 h-14 flex justify-center items-center rounded-lg text-xl text-white transition cursor-pointer ${
                loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-gray-400 rounded-full animate-spin"></div>
              ) : isEditing ? (
                "Update Article"
              ) : (
                "Publish Article"
              )}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
}
