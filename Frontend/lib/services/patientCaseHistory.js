import { apiClient } from "../api";
import { routes } from "../utils/constants/route";

export const getpatientHistoryById = async (visitId) => {
  try {
   const url = `${routes.audiologist.patientCaseHistory}${visitId}`;
    const response = await apiClient.get(url);
    const caseHistory = response?.data || response;
    
    return caseHistory;
  } catch (error) {
    console.error("❌ Get patient visit by ID failed:", {
      visitId ,
      status: error?.response?.status,
      message: error?.message,
    });
    throw error;
  }
};

export const addCaseHistory = async (caseHistoryData) => {
   try{
     const response = await apiClient.post(routes.audiologist.registerCaseHistory, caseHistoryData);
     const caseHistoryResponse = response?.data?.data || response?.data || response;
     return caseHistoryResponse
   }catch(err){
    throw err?.response?.data || "registration failed"
   }
}

export const addTrialForm = async (trialFormData) => {
   try{
     const response = await apiClient.post(routes.audiologist.registerTrialForm, trialFormData);
     const trialFormrResponse = response?.data?.data || response?.data || response;
     return trialFormrResponse
   }catch(err){
    throw err?.response?.data || "registration failed"
   }
}

// endpoint for creating one or more reports for a visit
export const createReports = async (reportData) => {
  try {
    // payload expected { patient_visit: <id>, reports: [{report_type, report_description}, ...] }
    const response = await apiClient.post(routes.audiologist.reportCreate, reportData);
    const reportResponse = response?.data?.data || response?.data || response;
    return reportResponse;
  } catch (err) {
    // propagate useful message
    throw err?.response?.data || "failed to create reports";
  }
}

export const getTrialDevice = async ({ serial_number = "", modal_id = ""}) => {
   const queryParams = new URLSearchParams();
    if (modal_id) queryParams.append("model_type_id", modal_id);
  try {
    const query = serial_number
      ? `?serial_number=${encodeURIComponent(serial_number)}&`
      : "?";

    const url = `${routes.audiologist.trialDeviceList}${query}${queryParams.toString() ? `${queryParams.toString()}` : ""}`;

    const response = await apiClient.get(url);
    return response?.data || [];
  } catch (error) {
    console.error("❌ failed to fetch trial device list", error);
    throw error;
  }
};

export const getModalList = async () => {
  try {
    const url = `${routes.audiologist.modalList}`; 
    const response = await apiClient.get(url);
    return response;
  }
  catch (error) {
    throw error;
  }
};

