"use client";
import { getCurrentUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();

  const user = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    getCurrentUser,
    () => null // server-side / initial value
  );

  useEffect(() => {
    if (!user) {
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [user, router]); // ← important: router should be in deps

  if (user === null) {
    // Still checking / loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Перевірка автентифікації...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // This branch should actually never be reached because of useEffect
    // but keeping it as safety net
    return fallback || null;
  }

  return <>{children}</>;
}