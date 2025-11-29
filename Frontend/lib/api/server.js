"use server";

import axios from "axios";
import { cookies } from "next/headers";
import { getApiBaseURL } from "../utils/config";

/**
 * Get API base URL for server-side
 */
const getBaseURL = () => {
  return getApiBaseURL();
};

/**
 * Create axios instance for server-side requests
 */
const createServerApi = () => {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const baseURL = getBaseURL();

  // Debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Creating server API instance with baseURL:", baseURL);
  }

  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  return instance;
};

/**
 * Server-side API methods
 * These methods work in server components and actions, automatically handling cookies
 */
export const apiServer = {
  /**
   * Make a GET request
   */
  get: async (url, config = {}) => {
    try {
      const api = createServerApi();
      const response = await api.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a POST request
   */
  post: async (url, data, config = {}) => {
    try {
      const api = createServerApi();
      const baseURL = getBaseURL();
      const fullUrl = `${baseURL}${url}`;
      console.log("🌐 Server API POST - Full URL:", fullUrl);
      console.log("📋 Request config:", {
        baseURL: api.defaults.baseURL,
        url,
        method: "POST",
      });
      const response = await api.post(url, data, config);
      return response.data;
    } catch (error) {
      console.error("❌ Server API POST error:", {
        url,
        baseURL: error?.config?.baseURL,
        fullURL: error?.config?.url ? `${error.config.baseURL}${error.config.url}` : "N/A",
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        message: error?.message,
        data: error?.response?.data,
      });
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  put: async (url, data, config = {}) => {
    try {
      const api = createServerApi();
      const response = await api.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a PATCH request
   */
  patch: async (url, data, config = {}) => {
    try {
      const api = createServerApi();
      const response = await api.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a DELETE request
   */
  delete: async (url, config = {}) => {
    try {
      const api = createServerApi();
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Set token in cookie (server-side)
   */
  setToken: (token, options = {}) => {
    const cookieStore = cookies();
    cookieStore.set("token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      ...options,
    });
  },

  /**
   * Remove token from cookie (server-side)
   */
  removeToken: () => {
    const cookieStore = cookies();
    cookieStore.delete("token", { path: "/" });
  },

  /**
   * Get token from cookie (server-side)
   */
  getToken: () => {
    const cookieStore = cookies();
    return cookieStore.get("token")?.value || null;
  },
};

export default apiServer;

