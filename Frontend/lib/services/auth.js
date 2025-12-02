"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";
import { getApiBaseURL } from "../utils/config";
import { useRouter } from "next/navigation";

/**
 * Login user and set token in cookie (client-side)
 */
export async function login(payload) {
  try {
    const data = await apiClient.post(routes.login, payload);
    if (data?.data?.access && data?.data?.user?.role?.name) {
      const role = data?.data?.user?.role?.name;
       apiClient.setToken(data?.data?.access);
       localStorage.setItem("userRole", role);
      //  router.push("/dashboard");
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
     localStorage.removeItem("userRole");
    return true;
  } catch (error) {
    throw error;
  }
};
