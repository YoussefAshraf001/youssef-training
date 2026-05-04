"use client";

// Custom Imports
import { useUser } from "../../hooks/useUser";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  // console.log("🟣 AppShell user:", user);

  return <>{children}</>;
}
