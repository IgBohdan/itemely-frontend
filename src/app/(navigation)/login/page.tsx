// app/auth/login/page.tsx
import { Suspense } from "react";
import { LoginForm } from "@/components/forms/LoginForm";
import PublicRoute from "@/components/PublicRoute";

const LoginPage = () => {
  return (
    <PublicRoute redirectIfAuthenticated="/calendar">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />}>
          <LoginForm />
        </Suspense>
      </div>
    </PublicRoute>
  );
};

export default LoginPage;
