"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="flex h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white sm:p-8 space-y-8">
        <div className="text-center">
          <h2 className="sm:text-3xl text-2xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-4 max-sm:text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
              prefetch={false}
            >
              Register
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
            {googleLoading && <Loader2 className="animate-spin mr-2" />} Sign in
            with Google
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;