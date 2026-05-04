"use client";

// Official Imports
import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { CiSettings } from "react-icons/ci";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

// Custom Imports
import { useUser } from "@/app/hooks/useUser";
import { useAuthStore } from "@/app/store/AuthStore";
import defaultavatar from "../../assets/default-avatar.svg";
import { Profile } from "../../types/Profile";
import { Article, ArticlesResponse } from "../../types/Articles";
import TabButton from "@/app/components/ui/TabButton";
import ArticleCard from "@/app/components/articles/ArticleCard/ArticleCard";
import ConfirmModal from "@/app/components/ui/ConfirmModal/ConfirmModal";

const apiRoot = process.env.NEXT_PUBLIC_API_ROOT;

const fetchJson = async <T,>(
  key: readonly [url: string, token: string | null],
): Promise<T> => {
  const [url, token] = key;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Token ${token}` } : undefined,
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export default function ProfilePage() {
  const params = useParams<{ username: string }>();
  const router = useRouter();

  const routeUsername = decodeURIComponent(params.username);
  const [activeTab, setActiveTab] = useState<"mine" | "favorited">("mine");
  const token = useAuthStore((s) => s.token);
  const { user: currentUser, isLoading: currentUserLoading } = useUser();

  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);
  const [hoveredAuthor, setHoveredAuthor] = useState<string | null>(null);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const viewedUsername =
    routeUsername === "undefined" && currentUser?.username
      ? currentUser.username
      : routeUsername;
  const encodedUsername = encodeURIComponent(viewedUsername);

  const profileKey =
    viewedUsername === "undefined"
      ? null
      : ([`${apiRoot}/profiles/${encodedUsername}`, token] as const);

  const articlesKey = useMemo(() => {
    if (viewedUsername === "undefined") {
      return null;
    }

    const query =
      activeTab === "mine"
        ? `author=${encodedUsername}`
        : `favorited=${encodedUsername}`;

    return [`${apiRoot}/articles?${query}&limit=10`, token] as const;
  }, [activeTab, encodedUsername, token, viewedUsername]);

  const {
    data: profileData,
    error: profileError,
    isLoading: profileLoading,
    mutate: mutateProfile,
  } = useSWR<{ profile: Profile }, Error>(profileKey, fetchJson);

  const {
    data: articlesData,
    error: articlesError,
    isLoading: articlesLoading,
    mutate: mutateArticles,
  } = useSWR<ArticlesResponse, Error>(articlesKey, fetchJson);

  const profile = profileData?.profile ?? currentUserFallback();
  const articles = articlesData?.articles ?? [];
  const isOwnProfile = currentUser?.username === profile?.username;

  function currentUserFallback(): Profile | undefined {
    if (!currentUser) {
      return undefined;
    }

    const routeMatchesCurrentUser =
      currentUser.username.toLowerCase() === viewedUsername.toLowerCase() ||
      viewedUsername === "undefined";

    if (!routeMatchesCurrentUser && !profileError) {
      return undefined;
    }

    return {
      username: currentUser.username,
      bio: currentUser.bio ?? null,
      image: currentUser.image ?? null,
      following: false,
    };
  }

  const handleArticleLike = async (article: Article) => {
    const method = article.favorited ? "DELETE" : "POST";

    const res = await fetch(`${apiRoot}/articles/${article.slug}/favorite`, {
      method,
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    const data = await res.json();

    mutateArticles((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        articles:
          activeTab === "favorited" && article.favorited
            ? prev.articles.filter((a) => a.slug !== article.slug)
            : prev.articles.map((a) =>
                a.slug === article.slug ? data.article : a,
              ),
      };
    }, false);

    mutateArticles();
  };

  const handleFollowProfile = async () => {
    if (!profile || isOwnProfile) return;

    if (!token) {
      toast("You must be logged in to follow users.", { icon: "⚠️" });
      return;
    }

    try {
      const method = profile.following ? "DELETE" : "POST";

      const res = await fetch(
        `${apiRoot}/profiles/${profile.username}/follow`,
        {
          method,
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update follow status");
      }

      mutateProfile({ profile: data.profile }, false);

      mutateArticles((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          articles: prev.articles.map((article) =>
            article.author.username === data.profile.username
              ? { ...article, author: data.profile }
              : article,
          ),
        };
      }, false);
    } catch (err) {
      console.error("Error toggling follow:", err);
      toast.error("Could not update follow status");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!slug) return;

    setDeleting(true);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_ROOT}/articles/${slug}`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      mutateArticles((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          articles: prev.articles.filter((a) => a.slug !== slug),
        };
      }, false);

      mutateArticles();
      setDeleteSlug(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (profileLoading || (currentUserLoading && !profile)) {
    return (
      <main className="pt-16">
        <div className="mx-auto h-6 w-6 animate-spin rounded-full border-4 border-zinc-200 border-t-green-500" />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex flex-col items-center justify-center h-full w-full text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-lg font-semibold text-zinc-200">
          Profile not found
        </h2>
        <p className="text-sm text-zinc-500 mt-1 mb-4">
          The profile you're looking for doesn’t exist.
        </p>

        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200 transition"
        >
          Go home
        </button>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <motion.section
        className="pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto max-w-4xl px-4 pb-6">
          <div className="flex flex-col justify-center items-center">
            <div className="h-24 w-24 overflow-hidden">
              <img
                src={profile.image || defaultavatar.src}
                alt={`${profile.username} avatar`}
                className="block h-full w-full object-cover rounded-full"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold leading-none text-zinc-800">
              {profile.username}
            </h1>

            <p className="mt-3 min-h-5 text-sm text-zinc-400">
              {profile.bio || ""}
            </p>
          </div>

          <div className="mt-3 flex justify-end">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="flex h-8 px-2 items-center gap-1 rounded border border-zinc-400 text-sm text-zinc-500 hover:bg-zinc-200"
              >
                <CiSettings />
                Edit Profile Settings
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleFollowProfile}
                className={`inline-flex h-7 items-center gap-1 rounded border px-3 text-sm transition ${
                  profile.following
                    ? "border-green-500 bg-green-500 text-white"
                    : "border-zinc-400 bg-transparent text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                <IoMdAdd />
                {profile.following ? "Unfollow" : "Follow"} {profile.username}
              </button>
            )}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mx-auto max-w-3xl">
          <div className="flex border-b border-zinc-300 text-sm">
            <TabButton
              active={activeTab === "mine"}
              onClick={() => setActiveTab("mine")}
            >
              My Posts
            </TabButton>
            <TabButton
              active={activeTab === "favorited"}
              onClick={() => setActiveTab("favorited")}
            >
              Favorited Posts
            </TabButton>
          </div>

          <div className="pt-6">
            {articlesLoading ? (
              <p className="text-sm text-zinc-400">Loading articles...</p>
            ) : articlesError ? (
              <p className="text-sm text-red-500">
                Unable to load articles: {articlesError.message}
              </p>
            ) : articles.length === 0 ? (
              <p className="text-sm text-zinc-800">
                No articles are here... yet.
              </p>
            ) : (
              articles.map((article) => (
                <ArticleCard
                  key={article.slug}
                  article={article}
                  currentUser={currentUser}
                  hoveredArticle={hoveredArticle}
                  hoveredAuthor={hoveredAuthor}
                  setHoveredArticle={setHoveredArticle}
                  setHoveredAuthor={setHoveredAuthor}
                  onLike={handleArticleLike}
                  onFollow={() => {}}
                  onDelete={(slug) => {
                    setDeleteSlug(slug);
                  }}
                  onEdit={(slug) =>
                    router.push(`/editor?slug=${encodeURIComponent(slug)}`)
                  }
                />
              ))
            )}
          </div>
        </div>
        <AnimatePresence>
          {deleteSlug && (
            <ConfirmModal
              open={!!deleteSlug}
              onCancel={() => setDeleteSlug(null)}
              onConfirm={() => handleDelete(deleteSlug)}
              loading={deleting}
              title="Delete article?"
              message="This will permanently remove the article."
            />
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
