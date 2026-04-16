"use client";

// Official Imports
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

// Custom Imports
import { useAuthStore } from "../store";

export default function Signin() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isDisabled =
    !form.email.trim() || !form.password.trim() || !isValidEmail(form.email);

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const setToken = useAuthStore((s) => s.setToken);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Signing in...");
    const email = form.email.trim();
    const password = form.password.trim();

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email", { id: toastId });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.realworld.show/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: {
            email,
            password,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("[auth flow] login failed:", {
          status: res.status,
          response: data,
          email,
          passwordLength: password.length,
        });

        const message = getApiErrorMessage(data, "Email or password is invalid");

        toast.error(message, { id: toastId });
        return;
      }

      console.log("[auth flow] login token received:", data.user.token);
      setToken(data.user.token);

      toast.success("Welcome back", {
        id: toastId,
      });

      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex flex-col justify-center">
          <div className="pb-4 text-center">
            <h1 className="text-[40px]">Sign in</h1>
            <Link className="text-green-600" href="/register">
              Need an account?
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex flex-col gap-3">
              <input
                id="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="h-[55px] w-[320px] lg:w-[540px] border border-zinc-200 rounded-lg px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="h-[55px] w-[320px] lg:w-[540px] border border-zinc-200 rounded-lg px-4 pr-10 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />

                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    console.log(showPassword);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex justify-end py-5">
              <button
                type="submit"
                disabled={isDisabled || loading}
                className={`h-[50px] w-[110px] flex justify-center items-center rounded-lg text-xl text-white transition
                ${isDisabled || loading ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}
              `}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function getApiErrorMessage(data: any, fallback: string) {
  if (!data?.errors) {
    return data?.message || fallback;
  }

  return Object.entries(data.errors)
    .flatMap(([field, messages]) =>
      Array.isArray(messages)
        ? messages.map((message) => `${field} ${message}`)
        : [`${field} ${messages}`],
    )
    .join(", ");
}
