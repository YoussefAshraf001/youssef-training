"use client";

//Official Imports
import { useEffect, useState } from "react";
import { FaHeart, FaRegEdit } from "react-icons/fa";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

//Custom Imports
import { Article } from "./types/Articles";
import { useAuthStore } from "./store";
import { useUser } from "./hooks/useUser";
import defaultavatar from "./assets/default-avatar.svg";
import ConfirmModal from "./components/ConfirmModal";
import TagsSidebar from "./components/TagsSidebar";
import { MdDeleteOutline } from "react-icons/md";
import ArticleCard from "./components/ArticleCard";

export default function Home() {
  const params = useParams<{ username: string }>();
  const token = useAuthStore((state) => state.token);

  const [tab, setTab] = useState("Global Feed");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredAuthor, setHoveredAuthor] = useState<string | null>(null);
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editBlocked, setEditBlocked] = useState(false);

  const routeUsername = decodeURIComponent(params.username);
  const { data: currentUser, isLoading: currentUserLoading } = useUser();

  const viewedUsername =
    routeUsername === "undefined" && currentUser?.username
      ? currentUser.username
      : routeUsername;
  const encodedUsername = encodeURIComponent(viewedUsername);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const url =
          tab === "Your Feed"
            ? `${process.env.NEXT_PUBLIC_API_ROOT}/articles/feed`
            : `${process.env.NEXT_PUBLIC_API_ROOT}/articles`;

        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        const data = await res.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error("Error fetching articles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tab, token, encodedUsername]);

  const handleArticleLike = async (article: Article) => {
    try {
      const method = article.favorited ? "DELETE" : "POST";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${article.slug}/favorite`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );

      const data = await res.json();

      setArticles((prev) =>
        prev.map((a) => (a.slug === article.slug ? data.article : a)),
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const handleFollow = async (author: any) => {
    try {
      const method = author.following ? "DELETE" : "POST";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/profiles/${author.username}/follow`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        },
      );

      const data = await res.json();

      // update ALL articles from this author
      setArticles((prev) =>
        prev.map((article) =>
          article.author.username === author.username
            ? { ...article, author: data.profile }
            : article,
        ),
      );
    } catch (err) {
      console.error("Error toggling follow:", err);
    }
  };

  const handleDelete = async () => {
    if (!deleteSlug) return;

    setDeleting(true);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${deleteSlug}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      setArticles((prev) => prev.filter((a) => a.slug !== deleteSlug));

      setDeleteSlug(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex justify-center mt-10 px-16">
      <div className="w-full max-w-6xl flex gap-8 px-4">
        {/* LEFT SIDE (FEED) */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6 text-sm">
            <button
              onClick={() => setTab("Your Feed")}
              className={`pb-2 ${
                tab === "Your Feed"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-zinc-400"
              }`}
            >
              Your Feed
            </button>

            <button
              onClick={() => setTab("Global Feed")}
              className={`pb-2 ${
                tab === "Global Feed"
                  ? "text-green-500 border-b-2 border-green-500"
                  : "text-zinc-400"
              }`}
            >
              Global Feed
            </button>
          </div>

          {/* Loading */}
          {loading ||
            (currentUserLoading && (
              <motion.div
                className="flex justify-center p-6 animate-pulse text-zinc-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="h-7 w-7 rounded-full border-t-2 animate-spin" />
              </motion.div>
            ))}

          {/* Articles */}
          {!loading && (
            <motion.div
              className="flex flex-col gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {articles.length === 0 && (
                <p className="text-sm text-zinc-400">
                  Your feed is empty. Follow some users to see their articles
                  here, or check out the
                  <a
                    className="pl-1 text-green-600"
                    onClick={() => setTab("Global Feed")}
                  >
                    Global Feed
                  </a>
                  !
                </p>
              )}

              {articles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  currentUser={currentUser}
                  hoveredArticle={hoveredArticle}
                  hoveredAuthor={hoveredAuthor}
                  setHoveredArticle={setHoveredArticle}
                  setHoveredAuthor={setHoveredAuthor}
                  onLike={handleArticleLike}
                  onFollow={handleFollow}
                  onDelete={(slug) => setDeleteSlug(slug)}
                  onEditBlocked={() => setEditBlocked(true)}
                />
              ))}
            </motion.div>
          )}
          <div>
            {/* I Will add the pagination here */}
            {/* pagination logic Here */}
          </div>
        </div>

        {/* RIGHT SIDE (TAGS) */}
        <TagsSidebar />
      </div>

      <AnimatePresence>
        {deleteSlug && (
          <ConfirmModal
            open={!!deleteSlug}
            onCancel={() => setDeleteSlug(null)}
            onConfirm={handleDelete}
            loading={deleting}
            title="Delete article?"
            message="This will permanently remove the article."
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editBlocked && (
          <ConfirmModal
            open={true}
            onCancel={() => setEditBlocked(false)}
            onConfirm={() => setEditBlocked(false)}
            title="Editing unavailable"
            message="Editing is currently disabled due to API limitations."
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// "use client";

// //Official Imports
// import { useEffect, useState } from "react";
// import { FaHeart, FaRegEdit } from "react-icons/fa";
// import { useParams } from "next/navigation";
// import { AnimatePresence, motion } from "framer-motion";

// //Custom Imports
// import { Article } from "./types/Articles";
// import { useAuthStore } from "./store";
// import { useUser } from "./hooks/useUser";
// import defaultavatar from "./assets/default-avatar.svg";
// import ConfirmModal from "./components/ConfirmModal";
// import TagsSidebar from "./components/TagsSidebar";
// import { MdDeleteOutline } from "react-icons/md";

// export default function Home() {
//   const params = useParams<{ username: string }>();
//   const token = useAuthStore((state) => state.token);

//   const [tab, setTab] = useState("Global Feed");
//   const [articles, setArticles] = useState<Article[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [hoveredAuthor, setHoveredAuthor] = useState<string | null>(null);
//   const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);
//   const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
//   const [deleting, setDeleting] = useState(false);
//   const [editBlocked, setEditBlocked] = useState(false);

//   const routeUsername = decodeURIComponent(params.username);
//   const { data: currentUser, isLoading: currentUserLoading } = useUser();

//   const viewedUsername =
//     routeUsername === "undefined" && currentUser?.username
//       ? currentUser.username
//       : routeUsername;
//   const encodedUsername = encodeURIComponent(viewedUsername);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const url =
//           tab === "Your Feed"
//             ? `${process.env.NEXT_PUBLIC_API_ROOT}/articles/feed`
//             : `${process.env.NEXT_PUBLIC_API_ROOT}/articles`;

//         const res = await fetch(url, {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Token ${token}`,
//           },
//         });

//         const data = await res.json();
//         setArticles(data.articles || []);
//       } catch (err) {
//         console.error("Error fetching articles:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [tab, token, encodedUsername]);

//   const handleArticleLike = async (article: Article) => {
//     try {
//       const method = article.favorited ? "DELETE" : "POST";

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${article.slug}/favorite`,
//         {
//           method,
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Token ${token}`,
//           },
//         },
//       );

//       const data = await res.json();

//       setArticles((prev) =>
//         prev.map((a) => (a.slug === article.slug ? data.article : a)),
//       );
//     } catch (err) {
//       console.error("Error toggling like:", err);
//     }
//   };

//   const handleFollow = async (author: any) => {
//     try {
//       const method = author.following ? "DELETE" : "POST";

//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_ROOT}/profiles/${author.username}/follow`,
//         {
//           method,
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Token ${token}`,
//           },
//         },
//       );

//       const data = await res.json();

//       // update ALL articles from this author
//       setArticles((prev) =>
//         prev.map((article) =>
//           article.author.username === author.username
//             ? { ...article, author: data.profile }
//             : article,
//         ),
//       );
//     } catch (err) {
//       console.error("Error toggling follow:", err);
//     }
//   };

//   const handleDelete = async () => {
//     if (!deleteSlug) return;

//     setDeleting(true);

//     try {
//       await fetch(
//         `${process.env.NEXT_PUBLIC_API_ROOT}/articles/${deleteSlug}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Token ${token}`,
//           },
//         },
//       );

//       setArticles((prev) => prev.filter((a) => a.slug !== deleteSlug));

//       setDeleteSlug(null);
//     } catch (err) {
//       console.error("Delete failed:", err);
//     } finally {
//       setDeleting(false);
//     }
//   };

//   return (
//     <div className="flex justify-center mt-10 px-16">
//       <div className="w-full max-w-6xl flex gap-8 px-4">
//         {/* LEFT SIDE (FEED) */}
//         <div className="flex-1">
//           {/* Tabs */}
//           <div className="flex gap-4 border-b mb-6 text-sm">
//             <button
//               onClick={() => setTab("Your Feed")}
//               className={`pb-2 ${
//                 tab === "Your Feed"
//                   ? "text-green-500 border-b-2 border-green-500"
//                   : "text-zinc-400"
//               }`}
//             >
//               Your Feed
//             </button>

//             <button
//               onClick={() => setTab("Global Feed")}
//               className={`pb-2 ${
//                 tab === "Global Feed"
//                   ? "text-green-500 border-b-2 border-green-500"
//                   : "text-zinc-400"
//               }`}
//             >
//               Global Feed
//             </button>
//           </div>

//           {/* Loading */}
//           {loading ||
//             (currentUserLoading && (
//               <motion.div
//                 className="flex justify-center p-6 animate-pulse text-zinc-600"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 transition={{ duration: 0.4 }}
//               >
//                 <div className="h-7 w-7 rounded-full border-t-2 animate-spin" />
//               </motion.div>
//             ))}

//           {/* Articles */}
//           {!loading && (
//             <motion.div
//               className="flex flex-col gap-6"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.4 }}
//             >
//               {articles.length === 0 && (
//                 <p className="text-sm text-zinc-400">
//                   Your feed is empty. Follow some users to see their articles
//                   here, or check out the
//                   <a
//                     className="pl-1 text-green-600"
//                     onClick={() => setTab("Global Feed")}
//                   >
//                     Global Feed
//                   </a>
//                   !
//                 </p>
//               )}

//               {articles.map((article) => (
//                 <div
//                   key={article.slug}
//                   className="border-b pb-6 relative"
//                   onMouseEnter={() => setHoveredArticle(article.slug)}
//                   onMouseLeave={() => setHoveredArticle(null)}
//                 >
//                   {/* Author */}
//                   <div
//                     className="flex items-center justify-between mb-2"
//                     onMouseEnter={() => setHoveredAuthor(article.slug)}
//                     onMouseLeave={() => setHoveredAuthor(null)}
//                   >
//                     {/* LEFT (author) */}
//                     <div className="flex items-center gap-2">
//                       <img
//                         src={article.author.image || defaultavatar.src}
//                         alt=""
//                         className="w-8 h-8 rounded-full"
//                       />

//                       <div className="text-sm">
//                         <p className="text-green-600">
//                           {article.author.username}
//                         </p>
//                         <p className="text-zinc-400 text-xs">
//                           {new Date(article.createdAt).toDateString()}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <div className="flex items-center gap-2 relative">
//                         {/* 👇 Follow button */}
//                         {article.author.username !== currentUser?.username && (
//                           <motion.div
//                             initial={{ x: 20, opacity: 0 }}
//                             animate={
//                               hoveredAuthor === article.slug
//                                 ? { x: 0, opacity: 1 }
//                                 : { x: 20, opacity: 0 }
//                             }
//                             transition={{ duration: 0.25 }}
//                           >
//                             <button
//                               onClick={() => handleFollow(article.author)}
//                               className={`text-xs px-2 py-1 rounded border transition
//                                 ${
//                                   article.author.following
//                                     ? "bg-green-500 text-white border-green-500"
//                                     : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
//                                 }
//                               `}
//                             >
//                               {article.author.following
//                                 ? "Following"
//                                 : "Follow"}
//                             </button>
//                           </motion.div>
//                         )}

//                         {/* 👇 Edit / Delete */}
//                         {article.author.username === currentUser?.username && (
//                           <motion.div
//                             initial={{ x: 20, opacity: 0 }}
//                             animate={
//                               hoveredArticle === article.slug
//                                 ? { x: 0, opacity: 1 }
//                                 : { x: 20, opacity: 0 }
//                             }
//                             transition={{ duration: 0.25 }}
//                             className="flex gap-2"
//                           >
//                             <button
//                               onClick={() => setEditBlocked(true)}
//                               className="flex items-center gap-1 text-xs border border-blue-400 text-blue-600 px-2 py-1 rounded hover:bg-blue-500 hover:text-white transition"
//                             >
//                               <FaRegEdit /> Edit Article
//                             </button>

//                             <button
//                               onClick={() => setDeleteSlug(article.slug)}
//                               className="flex items-center gap-1 text-xs border border-red-400 text-red-600 px-2 py-1 rounded hover:bg-red-500 hover:text-white transition"
//                             >
//                               <MdDeleteOutline /> Delete Article
//                             </button>
//                           </motion.div>
//                         )}

//                         {/* ❤️ Like button (keep it last) */}
//                         <div
//                           onClick={() => handleArticleLike(article)}
//                           className={`flex items-center gap-1 border rounded-md cursor-pointer text-xs px-2 py-1
//                               ${
//                                 article.favorited
//                                   ? "bg-green-500 text-white border-green-500"
//                                   : "text-green-600 border-green-400 hover:bg-green-500 hover:text-white"
//                               }
//                             `}
//                         >
//                           <FaHeart /> {article.favoritesCount}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Title */}
//                   <h2 className="text-lg font-semibold">{article.title}</h2>

//                   {/* Description */}
//                   <p className="text-zinc-500 text-sm mt-1">
//                     {article.description}
//                   </p>

//                   {/* Footer */}
//                   <div className="flex justify-between items-center mt-3 text-xs text-zinc-400">
//                     <span className="cursor-pointer hover:underline">
//                       Read more...
//                     </span>

//                     <div className="flex gap-2">
//                       {article.tagList.map((tag) => (
//                         <span
//                           key={tag}
//                           className="bg-zinc-100 px-2 py-1 rounded"
//                         >
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </motion.div>
//           )}
//         </div>

//         {/* RIGHT SIDE (TAGS) */}
//         <TagsSidebar />
//       </div>

//       <AnimatePresence>
//         {deleteSlug && (
//           <ConfirmModal
//             open={!!deleteSlug}
//             onCancel={() => setDeleteSlug(null)}
//             onConfirm={handleDelete}
//             loading={deleting}
//             title="Delete article?"
//             message="This will permanently remove the article."
//           />
//         )}
//       </AnimatePresence>
//       <AnimatePresence>
//         {editBlocked && (
//           <ConfirmModal
//             open={true}
//             onCancel={() => setEditBlocked(false)}
//             onConfirm={() => setEditBlocked(false)}
//             title="Editing unavailable"
//             message="Editing is currently disabled due to API limitations."
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
