// Official Imports
import Image from "next/image";

// Custom Imports
import logo from "../assets/conduit-logo.svg";

export default function Footer() {
  return (
    <>
      <hr className="pb-4 opacity-10" />
      <div className="w-full pb-5">
        <div className="flex justify-center items-center gap-2">
          <div>
            <Image
              src={logo}
              alt="conduit-logo"
              width={60}
              height={10}
              priority
            />
          </div>
          <div className="text-[12px]">
            <h3 className="text-zinc-300 flex gap-1">
              © 2026. An interactive learning project from
              <a
                className="hover:underline text-zinc-500 hover:text-green-800/50"
                href="https://github.com/realworld-apps/realworld"
              >
                RealWorld OSS Project.
              </a>
              Code licensed under MIT.
            </h3>
          </div>
        </div>
      </div>
    </>
  );
}
