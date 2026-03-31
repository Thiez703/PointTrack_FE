'use client'

import { useCurrentUser } from "@/hooks/useCurrentUser";

export function UserInitializer() {
  // This hook fetches the current user and tokens, then populates the Zustand store
  useCurrentUser();
  return null;
}
