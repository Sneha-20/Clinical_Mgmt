import { apiClient } from "../api";
import { routes } from "../utils/constants/route";

/**
 * Get single patient by ID
 * @param {number} patientId - Patient ID
 * @returns {Promise<Object>} Patient data
 */
export const getPatientById = async (patientId) => {
  try {
    const url = `${routes.patientProfile}${patientId}/`;
    const response = await apiClient.get(url);
    // Handle nested response structure
    const patient = response?.data || response;
    
    return patient;
  } catch (error) {
    console.error("❌ Get patient by ID failed:", {
      patientId,
      status: error?.response?.status,
      message: error?.message,
    });
    throw error;
  }
};

/**
 * Update patient partial data
 * @param {number|string} patientId
 * @param {Object} data - payload to patch
 */
export const updatePatient = async (patientId, data) => {
  try {
    const url = `${routes.patientProfile}${patientId}/update/`;
    const response = await apiClient.patch(url, data);
    return response;
  } catch (error) {
    console.error("❌ Update patient failed:", { patientId, message: error?.message });
    throw error;
  }
};
export const getVisitById = async (patientId) => {
  try {
    const url = `${routes.patientProfile}${patientId}/visits/`;
    const response = await apiClient.get(url);
    // Handle nested response structure
    const patientVisit = response?.data || response;
    
    return patientVisit;
  } catch (error) {
    console.error("❌ Get patient visit by ID failed:", {
      patientId,
      status: error?.response?.status,
      message: error?.message,
    });
    throw error;
  }
};


export const getPurchaseHistory = async (patientId) => {
  try {
    const url = `${routes.patientProfile}${patientId}/purchases/`;
    const response = await apiClient.get(url);
    // response may already be the API body (with keys: status, nextPage, totalPages, data)
    // Return response as-is so callers can read pagination fields and `data` array.
    return response;
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    throw error;
  }
};

export const getServiceVisits = async (patientId, page = 1) => {
  try {
    const url = `${routes.patientProfile}${patientId}/service-visits/`;
    // attach page param if provided
    const response = await apiClient.get(url, { params: { page } });
    return response;
  } catch (error) {
    console.error("Error fetching service visits:", error);
    throw error;
  }
};