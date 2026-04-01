"use client";

import { getCurrentUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CalendarPage from "./page";

export default function ProtectedCalendarPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      setIsAuthenticated(!!user);

      // Якщо користувач не автентифікований, перенаправляємо на сторінку входу
      if (!user) {
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      }
    };

    checkAuth();
  }, [router]);

  // Показуємо завантажувальний екран під час перевірки автентифікації
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Перевірка автентифікації...</p>
        </div>
      </div>
    );
  }

  // Якщо користувач автентифікований, відображаємо сторінку календаря
  if (isAuthenticated) {
    return <CalendarPage />;
  }

  // Якщо користувач не автентифікований, не повинно бути досягнення цього коду через редирект вище,
  // але на всяк випадок повертаємо заглушку
  return null;
}
