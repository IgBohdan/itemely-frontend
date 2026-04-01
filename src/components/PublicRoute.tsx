"use client";

import { getCurrentUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: string; // Path to redirect if user is already authenticated
}

export default function PublicRoute({
  children,
  redirectIfAuthenticated = "/",
}: PublicRouteProps) {
  const router = useRouter();

  // Using useSyncExternalStore to safely read from localStorage
  const user = useSyncExternalStore(
    (callback) => {
      // Subscribe to storage changes
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    getCurrentUser,
    () => null // Server-side value
  );

  useEffect(() => {
    if (user) {
      router.push(redirectIfAuthenticated);
    }
  }, [user, router, redirectIfAuthenticated]);

  // Redirect if user is already authenticated
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Перенаправлення...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render the child content
  return <>{children}</>;
}
