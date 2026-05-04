"use client";

// Official Imports
import useSWR from "swr";

// Custom Imports
import { useAuthStore } from "../store/AuthStore";
import { fetchUser } from "../api/user";

export const useUser = () => {
  const token = useAuthStore((s) => s.token);

  const { data, error, isLoading, mutate } = useSWR(
    token ? ["user", token] : null,
    ([, token]) => fetchUser(token),
    {
      revalidateOnFocus: false, // optional but common for auth
    },
  );

  return {
    user: data,
    isLoading,
    isError: error,
    mutateUser: mutate,
  };
};
