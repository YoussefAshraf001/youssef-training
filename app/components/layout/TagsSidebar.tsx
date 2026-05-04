"use client";

// Official Imports
import useSWR from "swr";

const apiRoot = process.env.NEXT_PUBLIC_API_ROOT;

type TagsResponse = {
  tags: string[];
};

export default function TagsSidebar({
  onTagClick,
  selectedTag,
}: {
  onTagClick: (tag: string) => void;
  selectedTag: string | null;
}) {
  const { data, error, isLoading } = useSWR<TagsResponse>(
    `${apiRoot}/tags`,
    (url: string) => fetch(url).then((res) => res.json()),
  );

  const tags = data?.tags ?? [];

  return (
    <div className="flex mx-auto w-full lg:w-50">
      <div className="p-4 rounded">
        <h3 className="text-sm font-semibold mb-3">Popular Tags</h3>

        {isLoading && <p className="text-xs text-zinc-400">Loading...</p>}

        {error && <p className="text-xs text-red-500">Failed to load tags</p>}

        {!isLoading && !error && (
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 rounded-full cursor-pointer transition ${
                  selectedTag === tag
                    ? "bg-green-500 text-white"
                    : "border border-zinc-200 hover:bg-zinc-200"
                }`}
                onClick={() => onTagClick(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
