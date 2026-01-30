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
    const { page = 1, service, search, status } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    if (search) queryParams.append("search", search);
    if (status && status !== "All") queryParams.append("status", status);
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
    const { page , service, search, status } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    if (search) queryParams.append("search", search);
    if (status && status !== "All") queryParams.append("status", status);
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
    throw error?.response?.data;
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

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard statistics data
 */
export const getDashboardStats = async () => {
  try {
    const url = routes.receptionistDashboard;
    const response = await apiClient.get(url);
    
    return response?.data || {};
  } catch (error) {
    console.error("❌ Dashboard stats fetch failed:", {
      status: error?.response?.status,
      message: error?.message,
    });
    throw error;
  }
};

/**
 * Get TGA service list
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} TGA service list with pagination
 */
export const getTgaServiceList = async (params = {}) => {
  try {
    const { page = 1, search = "", status = "" } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    if (search) queryParams.append("search", search);
    if (status) queryParams.append("status", status);
    
    const url = `${routes.tgaServiceList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    
    return {
      status: response.status || 200,
      data: response?.data || [],
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
    };
  } catch (error) {
    console.error("❌ TGA service list fetch failed:", error);
    throw error;
  }
};

/**
 * Get TGA service details
 * @param {number} serviceId - Service ID
 * @returns {Promise<Object>} Service details
 */
export const getTgaServiceDetails = async (serviceId) => {
  try {
    const url = `${routes.tgaServiceDetails}${serviceId}`;
    const response = await apiClient.get(url);
    return response?.data || response;
  } catch (error) {
    console.error("❌ TGA service details fetch failed:", error);
    throw error;
  }
};

/**
 * Update TGA service
 * @param {number} serviceId - Service ID
 * @param {Object} serviceData - Updated service data
 * @returns {Promise<Object>} Updated service data
 */
export const updateTgaService = async (serviceId, serviceData) => {
  try {
    const url = `${routes.tgaServiceUpdate}${serviceId}/update/`;
    const response = await apiClient.post(url, serviceData);
    return response?.data || response;
  } catch (error) {
    console.error("❌ TGA service update failed:", error);
    throw error?.response?.data || error;
  }
};

/**
 * Get patient list for service requests
 */
export const getPatientServiceList = async () => {
  try {
    const url = `${routes.patientServiceList}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Patient service list fetch error:", error);
    throw error;
  }
};

/**
 * Get service types
 */
export const getServiceTypes = async () => {
  try {
    const url = `${routes.serviceTypes}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Service types fetch error:", error);
    throw error;
  }
};

/**
 * Get device purchases for a patient
 */
export const getPatientDevicePurchases = async (patientId) => {
  try {
    const url = `${routes.patientDevicePurchases}/${patientId}/device-purchases/`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Patient device purchases fetch error:", error);
    throw error;
  }
};

/**
 * Create TGA service request
 */
export const createTgaServiceRequest = async (serviceData) => {
  try {
    const url = `${routes.tgaServiceCreate}`;
    const response = await apiClient.post(url, serviceData);
    return response.data;
  } catch (error) {
    console.error("TGA service request creation error:", error);
    throw error;
  }
};

/**
 * Get parts used in a service
 * @param {number} serviceId - Service ID
 * @returns {Promise<Object>} Parts used in the service
 */
export const getPartsUsed = async () => {
  try {
    const url = `${routes.partsUsed}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Parts used fetch error:", error);
    throw error;
  }
};

/**
 * Get all clinics
 * @returns {Promise<Object>} List of clinics
 */
export const getAllClinics = async () => {
  try {
    const url = `${routes.adminClinics}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Clinics fetch error:", error);
    throw error;
  }
};

/**
 * Get daily revenue status for a clinic
 * @param {number} clinicId - Clinic ID
 * @param {string} startDate - Start date (optional, format: YYYY-MM-DD)
 * @param {string} endDate - End date (optional, format: YYYY-MM-DD)
 * @returns {Promise<Object>} Daily revenue status
 */
export const getDailyRevenueStatus = async (clinicId, startDate = null, endDate = null) => {
  try {
    let url = `${routes.adminDailyStatus}?clinic_id=${clinicId}`;
    
    if (startDate) {
      url += `&start_date=${startDate}`;
    }
    if (endDate) {
      url += `&end_date=${endDate}`;
    }
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Daily revenue status fetch error:", error);
    throw error;
  }
};

/**
 * Get inventory status
 * @returns {Promise<Object>} Inventory status
 */
export const getInventoryStatus = async () => {
  try {
    const url = `${routes.adminInventoryStatus}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Inventory status fetch error:", error);
    throw error;
  }
};

