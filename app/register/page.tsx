"use client";

// Official Imports
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

import { useAuthStore } from "../store";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setToken = useAuthStore((s) => s.setToken);

  const isDisabled =
    !form.username.trim() || !form.email.trim() || !form.password.trim();

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Creating account...");
    const user = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password.trim(),
    };

    try {
      const res = await fetch("https://api.realworld.show/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("[auth flow] register failed:", {
          status: res.status,
          response: data,
          email: user.email,
          username: user.username,
        });

        toast.error(getApiErrorMessage(data, "Could not create account"), {
          id: toastId,
        });
        return;
      }
      await verifyLoginCredentials(user.email, user.password);

      toast.success("Welcome to Conduit", {
        id: toastId,
        icon: "👏",
      });

      setToken(data.user.token);
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex flex-col justify-center">
          <div className="pb-4 text-center">
            <h1 className="text-[40px]">Sign up</h1>
            <Link className="text-green-600" href="/signin">
              Have an account?
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex flex-col gap-3">
              <input
                id="username"
                type="text"
                placeholder="Username"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                className="h-[55px] w-[320px] lg:w-[540px] border border-zinc-200 rounded-lg px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
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
                  autoComplete="new-password"
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
                disabled={isDisabled}
                className={`h-[50px] w-[110px] flex justify-center items-center rounded-lg text-xl text-white transition
                ${isDisabled ? "bg-green-300 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}
              `}
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white border-t-gray-400 rounded-full animate-spin"></div>
                ) : (
                  "Sign up"
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

async function verifyLoginCredentials(email: string, password: string) {
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

  console.log("[auth flow] immediate login check after register:", {
    ok: res.ok,
    status: res.status,
    email,
    passwordLength: password.length,
    response: res.ok ? "token returned" : data,
  });
}
