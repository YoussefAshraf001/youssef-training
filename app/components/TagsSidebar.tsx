"use client";

import { useEffect, useState } from "react";

const apiRoot = process.env.NEXT_PUBLIC_API_ROOT;

type TagsResponse = {
  tags: string[];
};

export default function TagsSidebar() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiRoot}/tags`);
        const data: TagsResponse = await res.json();

        setTags(data.tags || []);
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return (
    <div className="w-50">
      <div className="bg-zinc-50 p-4 rounded">
        <h3 className="text-sm font-semibold mb-3">Popular Tags</h3>

        {loading ? (
          <p className="text-xs text-zinc-400">Loading...</p>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-zinc-200 hover:bg-zinc-300 transition px-2 py-1 rounded-full cursor-pointer"
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
