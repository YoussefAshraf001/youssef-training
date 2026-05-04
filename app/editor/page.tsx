"use client";

// Official Imports
import { Suspense } from "react";

// Custom Imports
import EditorContent from "./EditorContent";

export default function Editor() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
