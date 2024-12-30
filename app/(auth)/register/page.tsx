"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LoaderCircleIcon } from "lucide-react";
import { signIn, useSession } from "next-auth/react";

const SignupPage = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className="flex items-center justify-center h-full  px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 sm:p-8">
        <div className="text-center">
          <h2 className="sm:text-3xl text-2xl font-bold tracking-tight">
            Sign up for an account
          </h2>
          <p className="mt-4 max-sm:text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
              prefetch={false}
            >
              Sign in
            </Link>
          </p>
        </div>
        <form className="py-6">
          <Button
            disabled={googleLoading}
            variant="outline"
            className="w-full"
            onClick={async () => {
              setGoogleLoading(true);
              await signIn("google", {
                callbackUrl: `/dashboard`,
              });
              setGoogleLoading(false);
            }}
          >
            {googleLoading && (
              <LoaderCircleIcon className="animate-spin mr-2" />
            )}
            Sign Up with Google
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;