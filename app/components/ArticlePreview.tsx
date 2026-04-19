import { Article } from "../types/Articles";

import defaultavatar from "../assets/default-avatar.svg";
import Link from "next/link";

export default function ArticlePreview({ article }: { article: Article }) {
  return (
    <article className="border-b border-zinc-200 py-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={article.author.image || defaultavatar.src}
            alt={`${article.author.username} avatar`}
            className="block h-8 w-8 rounded-full object-cover"
          />
          <div className="text-sm leading-tight">
            <p className="m-0 text-green-600">{article.author.username}</p>
            <p className="m-0 text-xs text-zinc-400">
              {new Date(article.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <span className="rounded border border-green-500 px-2 py-1 text-xs text-green-600">
          {article.favoritesCount}
        </span>
      </div>

      <h2 className="m-0 text-xl font-semibold text-zinc-800 hover:text-green-500 duration-200 ease-in-out transition-all">
        <Link href={`/article/${article.slug}`}>{article.title}</Link>
      </h2>
      <p className="mt-1 text-sm text-zinc-500">{article.description}</p>

      <div className="mt-4 flex items-center justify-between gap-4 text-xs text-zinc-400">
        <span>Read more...</span>
        <div className="flex flex-wrap justify-end gap-2">
          {article.tagList.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-300 px-2 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
