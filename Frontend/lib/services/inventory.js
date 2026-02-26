
"use client";

import { routes } from "@/lib/utils/constants/route";
import apiClient from "../api/client";

/**
 * Get inventory dropdown options (categories, brands, models)
 * @param {Object} params - Query parameters
 * @param {string} params.category - Category name (optional)
 * @param {string} params.brand - Brand name (optional)
 * @returns {Promise<Object>} Response with dropdown options
 */
export const getInventoryDropdowns = async (params = {}) => {
  try {
    const { category, brand } = params;
    const queryParams = new URLSearchParams();
    if (category) queryParams.append("category", category);
    if (brand) queryParams.append("brand", brand);
    
    const url = `${routes.inventoryItemList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response || {};
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new inventory item
 * @param {Object} data - Inventory item data
 * @returns {Promise<Object>} Response from the API
 */
export const createInventoryItem = async (data) => {
  try {
    const url = routes.inventoryItemCreate;
    const response = await apiClient.post(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get list of inventory items
 * @param {Object} params - Query parameters (pagination, filters, etc.)
 * @returns {Promise<Object>} Response with inventory items list
 */
export const getInventoryItems = async (params = {}) => {
  try {
    const { page = 1,status, clinicId, type=false } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    if (status && status !== "All") queryParams.append("status", status);
    if (clinicId && clinicId !== "All") queryParams.append("clinic_id", clinicId.toString());
    if (type == true || type == false) queryParams.append("use_in_trial", type);
    
    const url = `${routes.inventoryItems}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return {
      items: response?.data || [],
      totalPages: response?.totalPages || 1,
      currentPage: response?.currentPage || page,
      totalItems: response?.totalItems || 0,
      lowItem: response?.low_count || 0,
      criticalItem: response?.critical_count || 0,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Add stock to inventory item (serialized or non-serialized)
 * @param {Object} data - Stock data
 * @returns {Promise<Object>} Response from the API
 */
export const addInventoryStock = async (data) => {
  try {
    const url = routes.inventorySerialNumberCreate;
    const response = await apiClient.post(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Update an inventory item
 * @param {number|string} id - Inventory item id
 * @param {Object} data - Fields to update
 */
export const updateInventoryItem = async (id, data) => {
  try {
    const url = `clinical/inventory-item/${id}/update/`;
    const response = await apiClient.put(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new brand
 * @param {Object} data - Brand data with category
 * @returns {Promise<Object>} Response from the API
 */
export const createBrand = async (data) => {
  try {
    const url = routes.inventoryBrandCreate;
    const response = await apiClient.post(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new model
 * @param {Object} data - Model data with category and brand_id
 * @returns {Promise<Object>} Response from the API
 */
export const createModel = async (data) => {
  try {
    const url = routes.inventoryModelCreate;
    const response = await apiClient.post(url, data);
    return response;
  } catch (error) {
    throw error;
  }
};



/**
 * Get serial list for an inventory item
 * @param {Object} params - Query params (inventory_item)
 */
export const getInventorySerialList = async (params = {}) => {
  try {
    const { inventory_item } = params;
    const queryParams = new URLSearchParams();
    if (inventory_item) queryParams.append('inventory_item', inventory_item.toString());
    const url = `clinical/inventory/serial/list/?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Get pending inventory items for a clinic
 * @param {Object} params - Query params (clinic_id required)
 * @returns {Promise<Array>} List of pending inventory items
 */
export const getPendingInventoryItems = async (params = {}) => {
  try {
    const { clinic_id } = params;
    if(clinic_id === "All") {
      const url = `clinical/inventory/items/pending/`;
      const response = await apiClient.get(url);
      return response.data || [];
    }
    const url = `clinical/inventory/items/pending/?clinic_id=${clinic_id}`;
    const response = await apiClient.get(url);
    return response.data || [];
  } catch (error) {
    throw error;
  }
};

/**
 * Approve a pending inventory item
 * @param {number|string} id - Inventory item id
 * @returns {Promise<Object>} Response from the API
 */
export const approvePendingInventoryItem = async (id) => {
  try {
    const url = `clinical/inventory/item/${id}/approve/`;
    const response = await apiClient.post(url);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getTransferHisotry = async (params = {}) => {
  try {
    const url = routes.TransferHistory;;
    const response = await apiClient.get(url);
    return response.data;
  }
  catch (error) {
    throw error;
  }
};
