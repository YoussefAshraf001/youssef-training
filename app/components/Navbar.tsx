// Official Imports
import Image from "next/image";
import Link from "next/link";

// Custom Imports
import logo from "../assets/conduit-logo.svg";

export default function Navbar() {
  return (
    <>
      <div className="w-full flex py-4">
        <div className="flex justify-evenly w-full px-2 py-1.5 gap-50">
          <div className="my-auto">
            <Image src={logo} alt="conduit-logo" className="h-5 w-30" />
          </div>
          <div>
            <ul className="flex items-center gap-4">
              <Link href={"/"}>
                <li className="text-zinc-300 hover:text-zinc-500 transition-all ease-in-out duration-300 cursor-pointer">
                  Home
                </li>
              </Link>
              <Link href={"/signin"}>
                <li className="text-[15px]">Sign in</li>
              </Link>
              <li className="w-17 h-7 bg-green-600 hover:bg-green-700 transition-all ease-in-out duration-300 cursor-pointer text-white text-center text-[13px] rounded-full">
                <Link href={"/register"}>
                  <p className="p-1">Sign up</p>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
