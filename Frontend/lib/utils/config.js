/**
 * API Configuration
 * Centralized configuration for API base URL
 */

/**
 * Get API base URL from environment variables
 * Priority:
 * 1. API_BASE_URL (server-side only, more secure)
 * 2. NEXT_PUBLIC_API_BASE_URL (client-side accessible)
 * 3. Default fallback
 */
export const getApiBaseURL = () => {
  // Debug: Log all available env vars (only in development)
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Environment variables check:", {
      API_BASE_URL: process.env.API_BASE_URL,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      isServer: typeof window === "undefined",
    });
  }

  // Server-side: prefer API_BASE_URL
  if (typeof window === "undefined") {
    const baseURL = 
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://51.20.207.138:8000/api";
    
    if (process.env.NODE_ENV === "development") {
      console.log("🌐 Server-side API Base URL:", baseURL);
    }
    
    return baseURL;
  }
  
  // Client-side: use NEXT_PUBLIC_API_BASE_URL
  let baseURL = 
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://51.20.207.138:8000/api";
  
  // Safety check: Never use localhost:3000 as API base URL
  if (baseURL.includes("localhost:3000") || baseURL.includes("127.0.0.1:3000")) {
    console.error("❌ ERROR: API Base URL cannot be localhost:3000!");
    console.error("Please set NEXT_PUBLIC_API_BASE_URL in your .env.local file");
    baseURL = "http://51.20.207.138:8000/api"; // Fallback to default
  }
  
  if (process.env.NODE_ENV === "development") {
    console.log("🌐 Client-side API Base URL:", baseURL);
  }
  
  return baseURL;
};

/**
 * Validate that API base URL is configured
 */
export const validateApiConfig = () => {
  const baseURL = getApiBaseURL();
  
  if (baseURL.includes("localhost:3000")) {
    console.warn(
      "⚠️ API Base URL is set to localhost:3000. Please configure NEXT_PUBLIC_API_BASE_URL in your .env.local file"
    );
  }
  
  return baseURL;
};

