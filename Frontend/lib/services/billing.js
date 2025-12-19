"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";

export const getTotalBillingList = async (params = {}) => {
  try {
    const { page , search } = params;
    // Build query string
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    // if (limit) queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    
    const url = `${routes.billing.billingList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const patientData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      billList:  response?.data || [],
    };
    
    return patientData;
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