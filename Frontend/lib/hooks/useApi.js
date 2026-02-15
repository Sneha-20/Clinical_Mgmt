"use client";

import { useState, useCallback } from "react";
import apiClient from "../api/client";

/**
 * Custom hook for making API calls from client components
 * Automatically handles loading states and errors
 * 
 * @example
 * const { data, loading, error, execute } = useApi();
 * 
 * const handleSubmit = async () => {
 *   const result = await execute(() => apiClient.post('/endpoint', data));
 * };
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.message || "Something went wrong";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook specifically for API client methods
 * Provides direct access to apiClient methods with loading states
 */
export const useApiClient = () => {
  const { loading, error, execute, reset } = useApi();

  const get = useCallback(
    async (url, config) => {
      return execute(() => apiClient.get(url, config));
    },
    [execute]
  );

  const post = useCallback(
    async (url, data, config) => {
      return execute(() => apiClient.post(url, data, config));
    },
    [execute]
  );

  const put = useCallback(
    async (url, data, config) => {
      return execute(() => apiClient.put(url, data, config));
    },
    [execute]
  );

  const patch = useCallback(
    async (url, data, config) => {
      return execute(() => apiClient.patch(url, data, config));
    },
    [execute]
  );

  const del = useCallback(
    async (url, config) => {
      return execute(() => apiClient.delete(url, config));
    },
    [execute]
  );

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    loading,
    error,
    reset,
  };
};

export default useApi;

