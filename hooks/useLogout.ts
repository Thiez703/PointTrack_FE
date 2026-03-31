"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { AuthService } from "@/app/services/auth.service";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await AuthService.logoutNext();
    } catch {
      // Ignore logout errors — always clear local auth and redirect
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return { isLoggingOut, handleLogout };
}
