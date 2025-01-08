"use client";

import Image from "next/image";
import Header from "@/components/Home/Header";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const Hero = () => {
  const { isSignedIn } = useUser();

  return (
    <div>
      <Header />
      <div
        className="relative isolate sm:px-6 lg:px-8 min-h-[85vh] mt-[15vh]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(30, 58, 138, 0.4) 1.5px, transparent 0)", // Dark blue (blue-900) with 0.3 opacity
          backgroundSize: "40px 40px",
        }}
      >
        {/* Left cursors */}
        <div className="absolute left-32 bottom-52 opacity-0 animate-[slideFromLeft_1s_ease-out_0.2s_forwards]">
          <Image
            src="https://ui.metamorix.com/favicon.ico"
            alt="ResQ Health Logo"
            width={32}
            height={40}
            className="h-10 w-8"
          />
        </div>
        <div className="absolute left-64 bottom-20 opacity-0 animate-[slideFromLeft_1s_ease-out_0.4s_forwards]">
          <Image
            src="https://ui.metamorix.com/favicon.ico"
            alt="Metamorix Logo"
            width={32}
            height={40}
            className="h-10 w-8"
          />
        </div>

        {/* Right cursors */}
        <div className="absolute right-32 bottom-52 opacity-0 animate-[slideFromRight_1s_ease-out_0.6s_forwards]">
          <Image
            src="https://ui.metamorix.com/favicon.ico"
            alt="Metamorix Logo"
            width={32}
            height={40}
            className="h-10 w-8"
          />
        </div>
        <div className="absolute right-64 bottom-20 opacity-0 animate-[slideFromRight_1s_ease-out_0.8s_forwards]">
          <Image
            src="https://ui.metamorix.com/favicon.ico"
            alt="Metamorix Logo"
            width={32}
            height={40}
            className="h-10 w-8"
          />
        </div>
        <div className="absolute left-1/2 top-1/3 -z-50 h-[30vh] w-[70vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-400 to-green-300 opacity-80 blur-[100px]" />
        <div className="mx-auto max-w-2xl md:py-16 py-28">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center"></div>
          <div className="text-center">
            <h1 className="text-6xl font-sans font-bold translate-y-[100px] opacity-0 animate-[slideUp_1s_ease-out_forwards]">
              {" "}
              Revolutionizing{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
                Personalized Healthcare
              </span>{" "}
              with AI
            </h1>

            <p className="mt-8 font-semibold text-xl leading-8 text-gray-700 dark:text-gray-300 max-w-2xl mx-auto opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards]">
              AI-powered assistant for personalized care and proactive public
              health solutions.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 opacity-0 animate-[slideInFromBottom_1s_ease-out_0.8s_forwards]">
              {isSignedIn ? (
                <Link
                  href="/chat"
                  className="group flex h-10 items-center justify-center rounded-md border border-orange-600 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-4 text-neutral-50 shadow-[inset_0_1px_0px_0px_#fdba74] active:[box-shadow:none]"
                >
                  <span className="block group-active:[transform:translate3d(0,1px,0)]">
                    Get started
                  </span>
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="group flex h-10 items-center justify-center rounded-md border border-orange-600 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-4 text-neutral-50 shadow-[inset_0_1px_0px_0px_#fdba74] active:[box-shadow:none]"
                >
                  <span className="block group-active:[transform:translate3d(0,1px,0)]">
                    Get started
                  </span>
                </Link>
              )}
              <a
                href="#features"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300"
              >
                Learn more <span aria-hidden="true"> → </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
