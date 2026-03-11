"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";

export const getTransactions = async (params = {}) => {
  try {
    const { transaction_type, page, transaction_date } = params;
    const queryParams = new URLSearchParams();
    if (transaction_type) queryParams.append("transaction_type", transaction_type);
    if (transaction_date) queryParams.append("transaction_date", transaction_date);
    if (page) queryParams.append("page", page.toString());

    const url = `${routes.transactions.list}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const transactionData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      transactions: response?.data || [],
    };

    return transactionData;
  } catch (error) {
    throw error;
  }
};

export const createTransaction = async (data) => {
  try {
    const response = await apiClient.post(routes.transactions.create, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateTransaction = async (id, data) => {
  try {
    const response = await apiClient.put(`${routes.transactions.update}${id}`, data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteTransaction = async (id) => {
  try {
    const response = await apiClient.delete(`${routes.transactions.delete}${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};