// Custom Imports
import { FaHeart } from "react-icons/fa";
import defaultavatar from "../../assets/default-avatar.svg";
import { IoMdAdd } from "react-icons/io";

type Props = {
  article: any;
  isOwnArticle: boolean;
  onFollow: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: () => void;
  variant?: "default" | "centered";
};

export default function ArticleMeta({
  article,
  isOwnArticle,
  onFollow,
  onEdit,
  onDelete,
  onFavorite,
  variant = "default",
}: Props) {
  const isCentered = variant === "centered";

  return (
    <div
      className={`flex items-center gap-4 ${
        isCentered ? "justify-center py-6" : "justify-between"
      }`}
    >
      <div className="flex items-center gap-2">
        <img
          src={article.author.image || defaultavatar.src}
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
          {isOwnArticle ? (
            <>
              <button
                onClick={onEdit}
                className="h-7 w-25 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-500 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
              >
                Edit Article
              </button>
              <button
                onClick={onDelete}
                className="h-7 w-31 text-sm text-red-700 opacity-60 hover:opacity-100 hover:text-white flex justify-center items-center gap-1 border border-red-300 hover:bg-red-800 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
              >
                Delete Article
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onFollow}
                className="px-3 py-1 text-sm text-zinc-300 hover:text-white flex justify-center items-center gap-1 border border-zinc-400 hover:bg-zinc-300 rounded-md transition-all ease-in-out duration-200 cursor-pointer"
              >
                <IoMdAdd /> Follow {article.author.username}
              </button>

              <button
                onClick={onFavorite}
                className={`px-3 py-1 text-sm flex justify-center items-center gap-1 border rounded-md transition-all ease-in-out duration-200 cursor-pointer ${
                  article.favorited
                    ? "bg-green-500 text-white border-green-500 hover:bg-green-600"
                    : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
                }`}
              >
                <FaHeart />
                {article.favorited ? "Unfavorite" : "Favorite"} Article (
                {article.favoritesCount})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
