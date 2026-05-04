"use client";

// Official Imports
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegEdit } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

// Custom Imports
import logo from "../../../assets/conduit-logo.svg";
import defaultavatar from "../../../assets/default-avatar.svg";
import { useUser } from "../../../hooks/useUser";
import { useAuthStore } from "../../../store/AuthStore";
import { useState } from "react";

export default function Navbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: any) => pathname === path;
  const token = useAuthStore((state) => state.token);
  const isLoggedIn = !!token;
  const base = "text-zinc-400 hover:text-zinc-600";
  const active = "text-zinc-800";

  return (
    <div className="w-full py-4 border-b z-40">
      <div className="flex items-center justify-between w-full px-4 max-w-6xl mx-auto">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image
            src={logo}
            alt="Conduit logo"
            width={120}
            height={30}
            className="w-24 sm:w-30"
          />
        </Link>
        {/* Hamburger */}
        <button
          className="sm:hidden text-2xl relative z-50"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`block transition-all duration-300 ${
              open ? "rotate-90 scale-110" : "rotate-0"
            }`}
          >
            {open ? <HiOutlineX /> : <HiOutlineMenu />}
          </span>
        </button>

        {/* Nav */}
        <ul
          className={`
            absolute left-0 top-16 w-full bg-white border-b p-4 flex flex-col gap-4 text-sm z-40
            transform transition-all duration-300 ease-in-out

            ${
              open
                ? "translate-y-0 opacity-100"
                : "-translate-y-5 opacity-0 pointer-events-none"
            }

            sm:flex sm:static sm:w-auto sm:flex-row sm:items-center sm:gap-4 sm:p-0 sm:border-none sm:bg-transparent sm:ml-auto sm:translate-y-0 sm:opacity-100 sm:pointer-events-auto
          `}
        >
          <li>
            <Link href="/" className={isActive("/") ? active : base}>
              Home
            </Link>
          </li>

          {!isLoggedIn ? (
            <>
              <li>
                <Link
                  href="/signin"
                  className={isActive("/signin") ? active : base}
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className={`{isActive("/register") ? active : base} bg-green-600 text-white px-3 py-1 rounded-full`}
                >
                  Sign up
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link
                  href="/editor"
                  className={`flex gap-1 items-center ${isActive("/editor") ? active : base}`}
                >
                  <FaRegEdit />
                  New Article
                </Link>
              </li>
              <li>
                <Link
                  href="/settings"
                  className={`flex gap-1 items-center ${isActive("/settings") ? active : base}`}
                >
                  <CiSettings />
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  href={`/profile/${user?.username}`}
                  className={`flex items-center gap-2 ${
                    pathname.startsWith("/profile") ? active : base
                  }`}
                >
                  <img
                    src={user?.image || defaultavatar.src}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />

                  <span>{user?.username || "Profile"}</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
