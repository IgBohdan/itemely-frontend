import { Activity } from "../types";
import { api } from "./api";
import { API_ROUTES } from "@/config/apiRoutes";

export const getActivityLog = async (): Promise<Activity[]> => {
  const res = await api.get(API_ROUTES.ACTIVITY_LOG.ALL);
  return res.data;
};
