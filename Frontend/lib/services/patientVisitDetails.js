import { apiClient } from "../api";
import { routes } from "../utils/constants/route";

/**
 * Get single patient by ID
 * @param {number} patientId - Patient ID
 * @returns {Promise<Object>} Patient data
 */
export const getPatientVisitById = async (visitId) => {
  try {
    const url = `${routes.audiologist.patientVisitdetails}${visitId}/`;
    const response = await apiClient.get(url);
    const visitDetails = response?.data || response;
    
    return visitDetails;
  } catch (error) {
    console.error("❌ Get visit Details by ID failed:", {
      patientId,
      status: error?.response?.status,
      message: error?.message,
    });
    throw error;
  }
};

// export const getVisitById = async (patientId) => {
//   try {
//     const url = `${routes.patientProfile}${patientId}/visits/`;
//     const response = await apiClient.get(url);
//     // Handle nested response structure
//     const patientVisit = response?.data || response;
    
//     return patientVisit;
//   } catch (error) {
//     console.error("❌ Get patient visit by ID failed:", {
//       patientId,
//       status: error?.response?.status,
//       message: error?.message,
//     });
//     throw error;
//   }
// };