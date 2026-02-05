"use client";

import apiClient from "../api/client";
import { routes } from "@/lib/utils/constants/route";

export async function getReceptionists(params = {}) {
  try {
    // const query = new URLSearchParams(params).toString();
    const url =  routes.pendingUser;
    const data = await apiClient.get(url);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function approveUser(id) {
  try {
    const data = await apiClient.post(`${routes.accountsUsers}${id}/approve/`);
    return data;
  } catch (error) {
    throw error;
  }
}

export async function rejectUser(id) {
  try {
    const data = await apiClient.post(`${routes.accountsUsers}${id}/reject/`);
    return data;
  } catch (error) {
    throw error;
  }
}


