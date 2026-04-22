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
  onEditBlocked: () => void;
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
  onEditBlocked,
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
            <p className="text-green-600">{article.author.username}</p>
            <p className="text-zinc-400 text-xs">
              {new Date(article.createdAt).toDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Follow */}
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

          {/* Edit/Delete */}
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
                onClick={onEditBlocked}
                className="flex items-center gap-1 text-xs border border-blue-400 text-blue-600 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition"
              >
                <FaRegEdit /> Edit Article
              </button>

              <button
                onClick={() => onDelete(article.slug)}
                className="flex items-center gap-1 text-xs border border-red-400 text-red-600 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition"
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
        </div>
      </div>

      <h2>{article.title}</h2>
      <p>{article.description}</p>

      <div className="flex justify-between gap-2 mt-4">
        <div>
          <button onClick={onEditBlocked} className="text-zinc-400 text-xs">
            Read More
          </button>
        </div>
        <div className="max-w-60 flex items-center gap-2 flex-wrap justify-end">
          {article.tagList.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-zinc-200 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
