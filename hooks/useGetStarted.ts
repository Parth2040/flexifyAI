"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export function useGetStarted() {
  const router = useRouter();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const handleGetStarted = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isLoggedIn) {
      router.push("/generate");
    } else {
      router.push("/login");
    }
  };

  return handleGetStarted;
}
