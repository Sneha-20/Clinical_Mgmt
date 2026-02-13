"use client";


import { routes } from "@/lib/utils/constants/route";
import { apiClient } from "../api";



export const getReferrals = async () => {
  try {
    const response = await apiClient.get(routes.referrals);
    const referallist= response?.data || response;
    
      return referallist

  } catch (error) {
    console.error('Error fetching referral data:', error);
    throw error; // Re-throw so the UI can handle the error state
  }
};


export const getReferalPatientdetails = async (params ={}) => {
  try {

    const { doctorname } = params;
    console.log("Doctor name in service:", doctorname);
    const queryParams = new URLSearchParams();
    if (doctorname) queryParams.append("referral_doctor", doctorname)
    const url = `${routes.patientreferrals}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const referalpatient= response?.data || response;
    
    return referalpatient

  } catch (error) {
    console.error('Error fetching referral data:', error);
    throw error; // Re-throw so the UI can handle the error state
  }
};