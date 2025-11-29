"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";
import { getApiBaseURL } from "../utils/config";

/**
 * Login user and set token in cookie (client-side)
 */
export async function login(payload) {
  try {
    const data = await apiClient.post(routes.login, payload);
    if (data?.data?.access) {
      apiClient.setToken(data?.data?.access);
    } 
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Register new user (client-side)
 */
export const register = async (payload) => {
  try {
    const data = await apiClient.post(routes.register, payload);
    
    // If registration returns a token, set it in cookie
    if (data.token) {
      apiClient.setToken(data.token);
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Logout user and clear token cookie (client-side)
 */
export const logoutAction = async () => {
  try {
    apiClient.removeToken();
    return true;
  } catch (error) {
    throw error;
  }
};
