"use client";

// Official Imports
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

    try {
      const res = await fetch("https://api.realworld.show/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: form }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return;
      }
      toast.success("Welcome to Conduit", {
        icon: "👏",
      });

      localStorage.setItem("token", data.user.token);
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
                onChange={handleChange}
                className="h-[55px] w-[320px] lg:w-[540px] border border-zinc-200 rounded-lg px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                id="email"
                type="text"
                placeholder="Email"
                onChange={handleChange}
                className="h-[55px] w-[320px] lg:w-[540px] border border-zinc-200 rounded-lg px-4 text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
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
