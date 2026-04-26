"use client";

import { Suspense } from "react";
import EditorContent from "./EditorContent";

export default function Editor() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
