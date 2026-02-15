/**
 * API Configuration
 * Centralized configuration for API base URL
 */
export const getApiBaseURL = () => {
  if (typeof window === "undefined") {
    const baseURL = 
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://51.20.207.138:8000/api";
    
    return baseURL;
  }
  
  // Client-side: use NEXT_PUBLIC_API_BASE_URL
  let baseURL = 
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://51.20.207.138:8000/api";
  
  if (baseURL.includes("localhost:3000") || baseURL.includes("127.0.0.1:3000")) {
    baseURL = "http://51.20.207.138:8000/api"; // Fallback to default
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

