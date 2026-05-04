import { ReactNode } from "react";

export default function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 bg-transparent px-4 pb-3 text-sm ${
        active
          ? "border-green-500 text-green-600"
          : "border-transparent text-zinc-400 hover:text-zinc-600"
      }`}
    >
      {children}
    </button>
  );
}
