"use client";

import apiClient from "../api/client";
import { routes } from "../utils/constants/route";

/**
 * Fetch list of clinics
 * This endpoint should be accessible without authentication
 */
export const getClinics = async () => {
  try {
    const res = await apiClient.get(routes.clinics, { skipAuth: true });
    return res?.data || [];
  } catch (error) {
    console.error("Error fetching clinics:", error);
    throw error;
  }
};
