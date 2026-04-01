// services/authService.ts
import { API_ROUTES } from "@/config/apiRoutes";
import { api } from "./api";

const SAVE_USER_TO_STORAGE = true; // Змінна для перемикання зберігання користувача в localStorage

export interface User {
  id: number;
  email: string;
  fullName: string;
}

export const login = async (
  email: string,
  password: string
): Promise<{ user: User; access_token: string }> => {
  const response = await api.post(API_ROUTES.AUTH.LOGIN, { email, password });
  const { user, access_token } = response.data;

  if (typeof window !== "undefined") {
    localStorage.setItem("token", access_token);
    if (SAVE_USER_TO_STORAGE) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }

  return { user, access_token };
};

export const register = async (
  email: string,
  password: string,
  fullName: string
): Promise<{ message: string; user: User }> => {
  const response = await api.post(API_ROUTES.AUTH.REGISTER, {
    email,
    password,
    fullName,
  });
  const { message, user } = response.data;

  if (typeof window !== "undefined" && SAVE_USER_TO_STORAGE) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  return { message, user };
};

let cachedUser: User | null = null;
let cachedUserStr: string | null = null;

// Helper to get current user from storage
export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");

  if (userStr === cachedUserStr) {
    return cachedUser;
  }

  if (!userStr) {
    cachedUser = null;
    cachedUserStr = null;
    return null;
  }

  try {
    cachedUser = JSON.parse(userStr);
    cachedUserStr = userStr;
    return cachedUser;
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
    cachedUser = null;
    cachedUserStr = null;
    return null;
  }
};

// Logout
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};
