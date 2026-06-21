"use client";

import { useRouter } from "next/navigation";

/**
 * "Get Started" always sends the user to the image generation page.
 * If they aren't signed in, the /generate proxy guard redirects them to /login.
 */
export function useGetStarted() {
  const router = useRouter();

  const handleGetStarted = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    router.push("/generate");
  };

  return handleGetStarted;
}
