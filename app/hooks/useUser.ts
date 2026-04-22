"use client";

import useSWR from "swr";
import { useAuthStore } from "../store/AuthStore";
import { fetchUser } from "../api/user";

export const useUser = () => {
  const token = useAuthStore((s) => s.token);

  return useSWR(token ? ["/api/user", token] : null, ([_, token]) => {
    // console.log("[auth flow] swr is now using it:", token);
    return fetchUser(token);
  });
};
