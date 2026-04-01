import { Category } from "../types";
import { api } from "./api";
import { API_ROUTES } from "@/config/apiRoutes";

export const getCategories = async (): Promise<Category[]> => {
  const res = await api.get(API_ROUTES.CATEGORIES.ALL);
  return res.data;
};

export const createCategory = async (name: string) => {
  const res = await api.post(API_ROUTES.CATEGORIES.CREATE, { name });
  return res.data;
};

export const deleteCategory = async (id: number) => {
  const res = await api.delete(API_ROUTES.CATEGORIES.DELETE(id));
  return res.data;
};
