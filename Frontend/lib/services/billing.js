"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";

export const getPaidBillList = async (params = {}) => {
  try {
    const { page} = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    
    const url = `${routes.billing.paidBillList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const paidBillData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      paidBillList:  response?.data || [],
    };
    
    return paidBillData;
  } catch (error) {
    throw error;
  }
};

export const getDueBillList = async (params = {}) => {
  try {
    const { page} = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    
    const url = `${routes.billing.dueBillList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const dueBillData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      dueBillList:  response?.data || [],
    };
    
    return dueBillData;
  } catch (error) {
    throw error;
  }
};

export const getBillById = async (visitId) => {
  try {
    
    // Build query string
    console.log("visitId in service",visitId)
    const url = `${routes.billing.billingDetail}${visitId}`;
    const response = await apiClient.get(url);
    console.log("response in service",response)
    const patientData = {
      status: response.status || 200,
      billDetail:  response?.data || [],
    };
    
    return patientData;
  } catch (error) {
    throw error;
  }
};

export const markBillAsPaid = async (billId, paymentData) => {
  try {
    const url = `${routes.billing.markBillPaid}${billId}/`;
    const response = await apiClient.post(url, paymentData);
    return response;
  } catch (error) {
    throw error;
  }
};