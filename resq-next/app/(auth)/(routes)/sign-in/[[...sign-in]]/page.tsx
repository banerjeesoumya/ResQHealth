"use client";
import { SignUp, SignIn } from "@clerk/nextjs";
export default function Page() {
  return (
    <div className="flex justify-center items-center mt-12">
      <SignIn
        fallbackRedirectUrl={"/chat"}
        signUpFallbackRedirectUrl={"/chat"}
        signUpUrl="/sign-up"
      />
    </div>
  );
}
