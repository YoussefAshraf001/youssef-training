"use client";

import { useUser } from "../hooks/useUser";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: user } = useUser();

  // console.log("🟣 AppShell user:", user);

  return <>{children}</>;
}
