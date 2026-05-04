"use client";

// Official Imports
import { motion } from "framer-motion";

type Props = {
  open: boolean;
  onConfirm?: () => void;
  onCancel: () => void;
  loading?: boolean;

  title?: string;
  message?: string;

  confirmText?: string;
  cancelText?: string;
  loadingText?: string;
  variant?: "danger" | "info";
};

export default function ConfirmModal({
  onConfirm,
  onCancel,
  loading = false,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText,
  cancelText,
  loadingText,
  variant = "danger",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{
          duration: 0.25,
          ease: "easeOut",
        }}
        className="relative bg-white rounded-xl shadow-lg p-6 w-[320px]"
      >
        <h2 className="text-lg font-semibold text-zinc-800">{title}</h2>

        <p className="text-sm text-zinc-500 mt-2">{message}</p>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm border rounded hover:bg-zinc-100"
          >
            {cancelText || "Cancel"}
          </button>

          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-3 py-1 text-sm rounded text-white transition disabled:opacity-50
        ${
          variant === "danger"
            ? "bg-red-500 hover:bg-red-600"
            : "bg-blue-500 hover:bg-blue-600"
        }
      `}
            >
              {loading ? loadingText || "Loading..." : confirmText || "OK"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
