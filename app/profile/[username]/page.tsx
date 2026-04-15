"use client";

export default function UnderConstruction() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center">
      {/* Animated Icon */}
      <div className="text-5xl animate-bounce mb-4">🚧</div>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-2">Page Under Construction</h1>

      {/* Subtitle */}
      <p className="text-zinc-500 mb-6">
        I’m still working on this page. Check back soon 👀
      </p>

      {/* Loading dots */}
      <div className="flex gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-150"></span>
        <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce delay-300"></span>
      </div>
    </div>
  );
}
