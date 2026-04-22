"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useUser } from "../hooks/useUser";
import { useAuthStore } from "../store/AuthStore";
import { motion } from "framer-motion";

export default function Settings() {
  const { data: user } = useUser();
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const logout = useAuthStore((s) => s.logout);

  const [form, setForm] = useState({
    username: "",
    email: "",
    image: "",
    bio: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      username: user.username || "",
      email: user.email || "",
      image: user.image || "",
      bio: user.bio || "",
      password: "",
    });
  }, [user]);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const token = useAuthStore.getState().token;

    try {
      const body: any = {
        user: {
          username: form.username,
          email: form.email,
          bio: form.bio,
          image: form.image,
        },
      };

      if (form.password.trim()) {
        body.user.password = form.password.trim();
      }

      const res = await fetch("https://api.realworld.show/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.errors
          ? Object.values(data.errors).flat().join(", ")
          : "Update failed";
        toast.error(errorMsg);
        return;
      }

      setToken(data.user.token);
      toast.success("Settings updated ✅");
      router.push(`/profile/${data.user.username}`);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center">
        <div className="mt-10 mx-auto w-6 h-6 border-4 border-white border-t-green-400 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <motion.div
      className="flex justify-center mt-10 pb-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-xl px-4">
        <h1 className="text-3xl text-center font-semibold mb-8">
          Your Settings
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Image */}
          <input
            name="image"
            type="text"
            placeholder="URL of profile picture"
            value={form.image}
            onChange={handleChange}
            className="border border-zinc-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Username */}
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            className="border border-zinc-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Bio */}
          <textarea
            name="bio"
            placeholder="Short bio about you"
            rows={5}
            value={form.bio}
            onChange={handleChange}
            className="border border-zinc-300 rounded px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="border border-zinc-300 rounded px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          {/* Password with eye */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-zinc-300 rounded px-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            Leave blank to keep current password
          </p>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded text-white transition ${
                loading ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-gray-400 rounded-full animate-spin"></div>
              ) : (
                "Update Settings"
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <hr className="my-6 border-zinc-200" />

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="border border-red-400 text-red-500 px-4 py-2 rounded text-sm hover:bg-red-50 transition"
        >
          Or click here to logout.
        </button>
      </div>
    </motion.div>
  );
}
