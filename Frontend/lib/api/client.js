"use client";

import api from "../axios";
import { getApiBaseURL } from "../utils/config";

/**
 * Client-side API methods
 * These methods work in client components and automatically handle cookies
 */
export const apiClient = {
  /**
   * Make a GET request
   */
  get: async (url, config = {}) => {
    try {
      // Ensure we're using the correct base URL (check at runtime)
      const expectedBaseURL = getApiBaseURL();
      if (api.defaults.baseURL !== expectedBaseURL) {
        api.defaults.baseURL = expectedBaseURL;
      }
      
      // The interceptor will also check and update, but we do it here too for safety
      const response = await api.get(url, {
        ...config,
        baseURL: expectedBaseURL, // Explicitly set baseURL in config
      });
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
      // Ensure we're using the correct base URL (check at runtime)
      const expectedBaseURL = getApiBaseURL();
      if (api.defaults.baseURL !== expectedBaseURL) {
        api.defaults.baseURL = expectedBaseURL;
      }
      
      // The interceptor will also check and update, but we do it here too for safety
      const response = await api.post(url, data, {
        ...config,
        baseURL: expectedBaseURL, // Explicitly set baseURL in config
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Make a PUT request
   */
  put: async (url, data, config = {}) => {
    try {
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
      const response = await api.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Set token in cookie (client-side)
   * Note: Client-side cookies cannot be httpOnly, but we set secure options
   */
  setToken: (token) => {
    if (typeof document !== "undefined") {
      // Set cookie with secure options
      // max-age: 24 hours (86400 seconds)
      // SameSite: Lax (protects against CSRF)
      // path: / (available site-wide)
      const isSecure = window.location.protocol === "https:";
      document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax${isSecure ? "; Secure" : ""}`;
      console.log("🍪 Token cookie set (client-side)");
    }
  },

  /**
   * Remove token from cookie (client-side)
   */
  removeToken: () => {
    if (typeof document !== "undefined") {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  },

  /**
   * Get token from cookie (client-side)
   */
  getToken: () => {
    if (typeof document !== "undefined") {
      return (
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1] || null
      );
    }
    return null;
  },
};

export default apiClient;

