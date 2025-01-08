"use client";
import { SignUp, SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <div className="flex justify-center items-center mt-12">
      <SignUp
        fallbackRedirectUrl={"/chat"}
        signInFallbackRedirectUrl={"/chat"}
        signInUrl="/sign-in"
      />
    </div>
  );
}
