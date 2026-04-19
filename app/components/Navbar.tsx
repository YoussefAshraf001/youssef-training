"use client";

// Official Imports
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegEdit } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";

// Custom Imports
import logo from "../assets/conduit-logo.svg";
import defaultavatar from "../assets/default-avatar.svg";
import { useUser } from "../hooks/useUser";

export default function Navbar() {
  const { data: user } = useUser();
  const pathname = usePathname();

  const isActive = (path: any) => pathname === path;
  const isLoggedIn =
    typeof window !== "undefined" && localStorage.getItem("token");

  const base = "text-zinc-400 hover:text-zinc-600";
  const active = "text-zinc-800";

  return (
    <div className="w-full flex py-4">
      <div className="flex justify-evenly w-full px-2 py-1.5 gap-50">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Conduit logo"
            width={120}
            height={30}
            priority
          />
        </Link>

        <ul className="flex items-center gap-4 text-[15px]">
          {/* Always visible */}
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
                  className={isActive("/register") ? active : base}
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
