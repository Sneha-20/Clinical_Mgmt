"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";

/**
 * Dashboard/Clinical Services
 * All dashboard-related API calls
 */

/**
 * Get patient list with pagination
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page
 * @param {string} params.search - Search query
 * @returns {Promise<Object>} Response with patient list and pagination info
 */
export const getPatientList = async (params = {}) => {
  try {
    const { page = 1, service, search } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    // if (limit) queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (service && service !== "All") queryParams.append("service_type", service);
    
    const url = `${routes.patientList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const patientData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      patients:   response?.data || [],
    };
    
    return patientData;
  } catch (error) {
    throw error;
  }
};

export const getTodayPatientList = async (params = {}) => {
  try {
    const { page = 1, service, search } = params;
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    // if (limit) queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (service && service !== "All") queryParams.append("service_type", service);
    
    const url = `${routes.todayPatientList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const patientData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      patients:  response?.data || [],
    };
    
    return patientData;
  } catch (error) {
    throw error;
  }
};

export const getDoctorList = async () => {
  try {
    const url = `${routes.doctorList}`;
    const response = await apiClient.get(url);
    const doctorData =  response?.data || [];
    return doctorData;
  } catch (error) {
    throw error;
  }
}




/**
 * Create new patient
 * @param {Object} patientData - Patient data
 * @returns {Promise<Object>} Created patient data
 */
export const createPatient = async (patientData) => {
  try {
    // console.log("📤 Creating patient:", patientData);
    
    const response = await apiClient.post(routes.patientRegister, patientData);

    // console.log("✅ Patient created:", response);
    getPatientList();
    // Handle nested response structure
    const patient = response?.data?.data || response?.data || response;
    
    return patient;
  } catch (error) {
    console.error("❌ Create patient failed:", {
      status: error?.response?.status,
      message: error?.message,
      data: error?.response?.data,
    });
    throw error;
  }
};

export const addNewVisit = async (patientData) => {
  try {
    const response = await apiClient.post(routes.patientVisit, patientData);
    getPatientList();
    // Handle nested response structure
    const patient = response?.data?.data || response?.data || response;
    
    return patient;
  } catch (error) {
    console.error("❌ Create patient failed:", {
      status: error?.response?.status,
      message: error?.message,
      data: error?.response?.data,
    });
    throw error;
  }
};

/**
 * Update patient
 * @param {number} patientId - Patient ID
 * @param {Object} patientData - Updated patient data
 * @returns {Promise<Object>} Updated patient data
 */
export const updatePatient = async (patientId, patientData) => {
  try {
    const url = `${routes.patientList}${patientId}/`;
    const response = await apiClient.put(url, patientData);
    
    // Handle nested response structure
    const patient = response?.data?.data || response?.data || response;
    
    return patient;
  } catch (error) {
    console.error("❌ Update patient failed:", {
      patientId,
      status: error?.response?.status,
      message: error?.message,
    });
    throw error;
  }
};

/**
 * Delete patient
 * @param {number} patientId - Patient ID
 * @returns {Promise<boolean>} Success status
 */
export const deletePatient = async (patientId) => {
  try {
    const url = `${routes.patientList}${patientId}/`;
    await apiClient.delete(url);
    return true;
  } catch (error) {
    throw error;
  }
};

export const searchPatient = async (searchTerm) => {
  try {
     const queryParams = new URLSearchParams();
     if (searchTerm) queryParams.append("search", searchTerm);
    const url = `${routes.searchPatient}?${queryParams.toString()}`;
     const response = await apiClient.get(url);

    return response.data;
  } catch (error) {
    throw error;
  }
};

