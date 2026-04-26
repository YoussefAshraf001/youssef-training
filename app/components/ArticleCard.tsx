import Link from "next/link";
import { Article } from "../types/Articles";
import defaultavatar from "../assets/default-avatar.svg";
import { FaHeart, FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { motion } from "framer-motion";

type Props = {
  article: Article;
  currentUser: any;
  hoveredArticle: string | null;
  hoveredAuthor: string | null;
  setHoveredArticle: (slug: string | null) => void;
  setHoveredAuthor: (slug: string | null) => void;
  onLike: (article: Article) => void;
  onFollow: (author: any) => void;
  onDelete: (slug: string) => void;
  onEdit: (slug: string) => void;
};

export default function ArticleCard({
  article,
  currentUser,
  hoveredArticle,
  hoveredAuthor,
  setHoveredArticle,
  setHoveredAuthor,
  onLike,
  onFollow,
  onDelete,
  onEdit,
}: Props) {
  return (
    <motion.div
      className="border-b border-zinc-200 p-4 relative bg-white"
      whileHover={{
        backgroundColor: "#f4f4f5",
      }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setHoveredArticle(article.slug)}
      onMouseLeave={() => setHoveredArticle(null)}
    >
      {/* Author */}
      <div
        className="flex items-center justify-between mb-2"
        onMouseEnter={() => setHoveredAuthor(article.slug)}
        onMouseLeave={() => setHoveredAuthor(null)}
      >
        <div className="flex items-center gap-2">
          <img
            src={article.author.image || defaultavatar.src}
            className="w-8 h-8 rounded-full"
          />

          <div className="text-sm">
            <Link
              href={`/profile/${article.author.username}`}
              className="text-green-600 hover:underline hover:text-green-800 transition"
            >
              {article.author.username}
            </Link>
            <p className="text-zinc-400 text-xs">
              {new Date(article.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* <div className="flex items-center gap-2">
          {article.author.username !== currentUser?.username && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={
                hoveredAuthor === article.slug
                  ? { x: 0, opacity: 1 }
                  : { x: 20, opacity: 0 }
              }
              transition={{ duration: 0.25 }}
            >
              <button
                onClick={() => onFollow(article.author)}
                className={`text-xs px-2 py-1 rounded border transition cursor-pointer
                   ${
                     article.author.following
                       ? "bg-green-500 text-white border-green-500"
                       : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
                   }
                   `}
              >
                {article.author.following ? "Following" : "Follow"}
              </button>
            </motion.div>
          )}

          {article.author.username === currentUser?.username && (
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={
                hoveredArticle === article.slug
                  ? { x: 0, opacity: 1 }
                  : { x: 20, opacity: 0 }
              }
              transition={{ duration: 0.25 }}
              className="flex gap-2"
            >
              <button
                onClick={() => onEdit(article.slug)}
                className="h-6 w-25 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
              >
                <FaRegEdit /> Edit Article
              </button>

              <button
                onClick={() => onDelete(article.slug)}
                className="h-6 w-31 text-sm text-red-600 hover:text-white flex justify-center items-center gap-1 border border-red-400 hover:bg-red-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
              >
                <MdDeleteOutline /> Delete Article
              </button>
            </motion.div>
          )}

          <div
            onClick={() => onLike(article)}
            className={`flex items-center gap-1 border rounded-md cursor-pointer text-xs px-2 py-1
               ${
                 article.favorited
                   ? "bg-green-500 text-white border-green-500"
                   : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
               }
               `}
          >
            <FaHeart /> {article.favoritesCount}
          </div>
        </div> */}
      </div>

      <Link href={`/article/${article.slug}`} className="block">
        <h2 className="font-semibold text-3xl text-zinc-700 hover:text-green-700 transition">
          {article.title}
        </h2>
      </Link>
      <p className="text-zinc-400">{article.description}</p>

      <div className="flex justify-between gap-2 mt-4">
        <div>
          <Link
            href={`/article/${article.slug}`}
            className="text-zinc-400 text-xs hover:text-green-600 transition"
          >
            Read More
          </Link>
        </div>
        <div className="max-w-80 flex items-center gap-2 flex-wrap justify-end">
          {article.tagList.map((tag) => (
            <span
              key={tag}
              className="text-xs text-zinc-400 border border-zinc-200 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
