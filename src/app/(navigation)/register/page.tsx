// app/auth/register/page.tsx
import { Suspense } from "react";
import { RegisterForm } from "@/components/forms/RegisterForm";
import PublicRoute from "@/components/PublicRoute";

const RegisterPage = () => {
  return (
    <PublicRoute redirectIfAuthenticated="/calendar">
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Suspense fallback={<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </PublicRoute>
  );
};

export default RegisterPage;
