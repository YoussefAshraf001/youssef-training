import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const getStoredToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const useAuthStore = create<AuthState>((set) => ({
  token: getStoredToken(),

  setToken: (token) => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    set({ token });

    console.log("[auth flow] zustand has the token stored:", {
      storeToken: token,
      localStorageToken: getStoredToken(),
    });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },
}));
