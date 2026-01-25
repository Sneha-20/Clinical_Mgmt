"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";

/**
 * Get followup patient list with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {boolean} params.contacted - Whether to get completed (true) or pending (false) followups
 * @returns {Promise<Object>} Response with followup list and pagination info
 */
export const getFollowupList = async (params = {}) => {
  try {
    const { page = 1, contacted } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    queryParams.append("contacted", contacted.toString());
    
    const url = `${routes.followupList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const followupData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      patients: response?.data || [],
    };
    
    return followupData;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark a patient visit as contacted
 * @param {number} visitId - The visit ID to mark as contacted
 * @returns {Promise<Object>} Response from the API
 */
export const markAsContacted = async (visitId) => {
  try {
    const url = `${routes.markContacted}${visitId}/mark-contacted/`;
    const response = await apiClient.post(url);
    return response;
  } catch (error) {
    throw error;
  }
};