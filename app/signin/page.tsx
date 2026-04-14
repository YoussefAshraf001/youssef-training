// Official Imports
import Link from "next/link";

export default function signin() {
  return (
    <>
      <div className="flex items-center justify-center">
        <div className="flex flex-col justify-center">
          <div className="pb-8 text-center">
            <h1 className="text-[40px]">Sign in</h1>
            <Link className="text-green-600" href="/register">
              Need an account?
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Email"
                className="h-13 w-70 lg:w-135 border border-zinc-200 rounded-lg placeholder:pl-6 placeholder:text-[20px]"
              />
              <input
                type="password"
                placeholder="Password"
                className="h-13 w-70 lg:w-135 border border-zinc-200 rounded-lg placeholder:pl-6 placeholder:text-[20px]"
              />
            </div>
            <div className="flex justify-end py-5">
              <button className="h-12.5 w-27 rounded-lg bg-green-500 text-white text-xl">
                Sign in
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Youssef's To do plan for Sign In
// Step 01 - Build the ui template
// Step 02 - integrate auth api
// Step 03 - review the success and error handling

//MISSING
// the sign in button should dim if both inputs are not entered.
