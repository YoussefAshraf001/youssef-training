"use client";

export default function Home() {
  return (
    <div className="flex justify-center mt-10">
      <div className="w-full max-w-6xl flex gap-8 px-4">
        {/* LEFT SIDE (FEED) */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6 text-sm">
            <button className="text-zinc-400">Your Feed</button>
            <button className="text-green-500 border-b-2 border-green-500 pb-2">
              Global Feed
            </button>
          </div>

          {/* Article placeholder */}
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="border-b pb-6">
                {/* Author */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-300 rounded-full" />
                    <div className="text-sm">
                      <p className="text-green-600">username</p>
                      <p className="text-zinc-400 text-xs">date</p>
                    </div>
                  </div>

                  <div className="border border-green-500 text-green-500 text-xs px-2 py-1 rounded">
                    hearticon 0
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-lg font-semibold">
                  Article title goes here
                </h2>

                {/* Description */}
                <p className="text-zinc-500 text-sm mt-1">
                  description of the article...
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center mt-3 text-xs text-zinc-400">
                  <span>Read more...</span>

                  <div className="flex gap-2">
                    <span className="bg-zinc-100 px-2 py-1 rounded">tag</span>
                    <span className="bg-zinc-100 px-2 py-1 rounded">tag</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE (TAGS) */}
        <div className="w-[200px]">
          <div className="bg-zinc-50 p-4 rounded">
            <h3 className="text-sm font-semibold mb-3">Popular Tags</h3>

            <div className="flex flex-wrap gap-2 text-xs">
              {[
                "ai",
                "api",
                "architecture",
                "backend",
                "beginners",
                "datascience",
                "frontend",
                "hooks",
                "javascript",
                "machinelearning",
                "nodejs",
                "programming",
                "python",
                "react",
                "webdev",
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-zinc-200 hover:bg-zinc-300 transition px-2 py-1 rounded-full cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
