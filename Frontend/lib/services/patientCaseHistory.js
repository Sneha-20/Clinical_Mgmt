import { apiClient } from "../api";
import { routes } from "../utils/constants/route";

export const getpatientHistoryById = async (visitId) => {
  try {
   const url = `${routes.audiologist.patientCaseHistory}${visitId}`;
    const response = await apiClient.get(url);
    // Handle nested response structure
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

export const addTestFile = async (file) => {
   try{
     const response = await apiClient.postMultipart(routes.audiologist.uploadFile, file);
     const caseHistoryResponse = response?.data?.data || response?.data || response;
     return caseHistoryResponse
   }catch(err){
    throw err?.response?.data || "failed to add test report"
   }
}

export const getAllTestFile = async (visitId) => {
   try{
     const response = await apiClient.get(`${routes.audiologist.getTestFile}${visitId}/`);
     const testFileList = response?.data?.data || response?.data || response;
     return testFileList;
   }catch(err){
    throw err?.response?.data || "Failed to fetch test report list"
   }
}

export const deleteTestReport = async (fileId) => {
   try{
     const response = await apiClient.delete(`${routes.audiologist.deleteTestFile}${fileId}/delete/`);
     const deleteResponse = response?.data?.data || response?.data || response;
     return deleteResponse;
   }catch(err){
    throw err?.response?.data || "Failed to fetch test report list"
   }
}

// export const getTrialDevice = async ({}) => {
//   try {
//    const url = `${routes.audiologist.trialDeviceList}`;
//     const response = await apiClient.get(url);
//     // Handle nested response structure
//     const trialDeviceList = response?.data || response;
//     return trialDeviceList;
//   } catch (error) {
//     console.error("❌ failed to fetch trial device list", {
//       status: error?.response?.status,
//       message: error?.message,
//     });
//     throw error;
//   }
// };
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

