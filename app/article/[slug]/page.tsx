"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Article } from "../../types/Articles";
import { IoMdAdd } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import { useUser } from "../../hooks/useUser";
import CommentSection from "@/app/components/CommentSection";
import CommentList from "@/app/components/CommentList";

function Page() {
  const params = useParams();
  const slug = params?.slug as string;
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentRefresh, setCommentRefresh] = useState(0);
  const { data: user } = useUser();

  useEffect(() => {
    if (!slug) return;

    const handleDataFetch = async () => {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${slug}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
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
  }, [slug]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!article) return <div className="p-6">Article not found</div>;

  return (
    <>
      <div className="mt-6 w-full max-w-2xl mx-auto px-6">
        <h2 className="text-[50px] font-semibold mb-4">{article?.title}</h2>
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
              <button className="h-6 w-31 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-300 rounded-md transition-all ease-in-out duration-200 cursor-pointer">
                <IoMdAdd /> Follow {article.author.username}
              </button>
              <button className="h-6 w-35 text-sm text-green-600 hover:text-white flex justify-center items-center gap-1 border border-green-400 hover:bg-green-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer">
                <FaHeart /> Favorite Article ({article.favoritesCount})
              </button>
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
            <button className="h-6 w-31 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-300 rounded-md transition-all ease-in-out duration-200 cursor-pointer">
              <IoMdAdd /> Follow {article.author.username}
            </button>
            <button className="h-6 w-35 text-sm text-green-600 hover:text-white flex justify-center items-center gap-1 border border-green-400 hover:bg-green-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer">
              <FaHeart /> Favorite Article ({article.favoritesCount})
            </button>
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
      </div>
    </>
  );
}

export default Page;
