"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { register } from "../../services/authService";

export const RegisterForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/login";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(email, password, fullName);
      toast.success("Реєстрація успішна! Перенаправлення на вхід...");
      router.push(decodeURIComponent(redirect));
      router.refresh();
    } catch (err) {
      const errorResponse = err as {
        response?: { data?: { message?: string } };
      };
      const errorMessage =
        errorResponse.response?.data?.message || "Registration failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-20 p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
    >
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        Register
      </h1>
      {error && (
        <p className="text-red-500 mb-4 text-sm text-center bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        disabled={loading}
        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-gray-500 bg-gray-50 text-gray-900"
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-gray-500 bg-gray-50 text-gray-900"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:border-gray-500 bg-gray-50 text-gray-900"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-800 text-white p-3 rounded hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Registering..." : "Register"}
      </button>
      <p className="mt-4 text-center text-sm text-gray-600">
        Вже є акаунт?{" "}
        <a
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="text-gray-800 hover:underline"
        >
          Увійти
        </a>
      </p>
    </form>
  );
};
