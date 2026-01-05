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