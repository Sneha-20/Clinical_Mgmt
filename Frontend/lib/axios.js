import axios from "axios";
import { getApiBaseURL, validateApiConfig } from "./utils/config";

// Get validated API base URL (initial value)
const initialBaseURL = validateApiConfig();

// Log the base URL being used (only in development)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 Axios configured with initial base URL:", initialBaseURL);
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: initialBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookies to be sent/received
});

// Request interceptor to add token from cookies and ensure correct base URL (client-side)
if (typeof window !== "undefined") {
  api.interceptors.request.use(
    (config) => {
      // Always check and update base URL at request time (in case env vars changed)
      const currentBaseURL = getApiBaseURL();
      if (config.baseURL !== currentBaseURL) {
        console.log("🔄 Updating base URL in interceptor:", {
          old: config.baseURL,
          new: currentBaseURL,
        });
        config.baseURL = currentBaseURL;
        // Also update the default for future requests
        api.defaults.baseURL = currentBaseURL;
      }
      
      // Get token from cookies on client-side
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // Remove Authorization header if no token
        delete config.headers.Authorization;
      }
      
      // Log request details in development
      if (process.env.NODE_ENV === "development") {
        console.log("📤 Axios Request:", {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          hasToken: !!token,
        });
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - token might be expired
      if (typeof window !== "undefined") {
        // Clear token cookie on client
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Optionally redirect to login
        // window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
