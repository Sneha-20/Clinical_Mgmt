"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getInventoryDropdowns,
  createInventoryItem,
  getInventoryItems,
  addInventoryStock,
  updateInventoryItem,
} from "@/lib/services/inventory";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { set } from "date-fns";

export default function useInventory() {
  const dispatch = useDispatch();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [lowItemCount, setLowItemCount] = useState(0);
  const [criticalItemCount, setCriticalItemCount] = useState(0);

  // Current status filter (All | Critical | Low)
  const [filterStatus, setFilterStatus] = useState("All");

  // Fetch inventory items list
  const fetchInventoryItems = useCallback(
    async (page = 1, statusParam) => {
      const status = statusParam ?? filterStatus;
      try {
        dispatch(startLoading());
        const data = await getInventoryItems({ page, status });
        console.log("Data fetched:", data);
        setInventoryItems(data.items || []);
        setLowItemCount(data.lowItem || 0);
        setCriticalItemCount(data.criticalItem || 0);
        setPagination({
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 1,
          totalItems: data.totalItems || 0,
        });
      } catch (error) {
        console.error("Error fetching inventory items:", error);
        showToast({ type: "error", message: "Failed to fetch inventory items" });
        setInventoryItems([]);
      } finally {
        dispatch(stopLoading());
      }
    },
    [dispatch, filterStatus]
  );

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getInventoryDropdowns();
      setCategories(data?.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  // Fetch brands when category is selected
  const fetchBrands = useCallback(async (category) => {
    if (!category) {
      setBrands([]);
      setModels([]);
      return;
    }
    try {
      const data = await getInventoryDropdowns({ category });
      setBrands(data?.brands || []);
      setModels([]); // Reset models when category changes
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  }, []);

  // Fetch models when brand is selected
  const fetchModels = useCallback(async (category, brand) => {
    if (!brand || !category) {
      setModels([]);
      return;
    }
    try {
      const data = await getInventoryDropdowns({ category, brand });
      setModels(data?.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    }
  }, []);

  // Change active filter and fetch items for that status
  const changeFilter = useCallback(
    async (status) => {
      setFilterStatus(status);
      await fetchInventoryItems(1, status);
    },
    [fetchInventoryItems]
  );

  // Create inventory item
  const createItem = useCallback(
    async (itemData) => {
      try {
        dispatch(startLoading());
        await createInventoryItem(itemData);
        showToast({ type: "success", message: "Inventory item created successfully" });
        await fetchInventoryItems(pagination.currentPage, filterStatus);
        return true;
      } catch (error) {
        console.error("Error creating inventory item:", error);
        showToast({
          type: "error",
          message: error?.response?.data?.error || "Failed to create inventory item",
        });
        return false;
      } finally {
        dispatch(stopLoading());
      }
    },
    [dispatch, fetchInventoryItems, pagination, filterStatus]
  );

  // Add stock to inventory item
  const addStock = useCallback(
    async (stockData) => {
      try {
        dispatch(startLoading());
        await addInventoryStock(stockData);
        showToast({ type: "success", message: "Stock added successfully" });
        await fetchInventoryItems(pagination.currentPage, filterStatus);
        return true;
      } catch (error) {
        console.error("Error adding stock:", error);
        showToast({
          type: "error",
          message: error?.response?.data?.error || "Failed to add stock",
        });
        return false;
      } finally {
        dispatch(stopLoading());
      }
    },
    [dispatch, fetchInventoryItems, pagination, filterStatus]
  );

  // Update inventory item
  const updateItem = useCallback(
    async (itemId, itemData) => {
      console.log("useInventory.updateItem called", { itemId, itemData });
      try {
        dispatch(startLoading());
        const res = await updateInventoryItem(itemId, itemData);
        console.log("useInventory.updateItem response", res);
        showToast({ type: "success", message: "Inventory item updated successfully" });
        await fetchInventoryItems(pagination.currentPage, filterStatus);
        return true;
      } catch (error) {
        console.error("Error updating inventory item:", error);
        showToast({
          type: "error",
          message: error?.response?.data?.error || "Failed to update inventory item",
        });
        return false;
      } finally {
        dispatch(stopLoading());
      }
    },
    [dispatch, fetchInventoryItems, pagination, filterStatus]
  );



  useEffect(() => {
    fetchInventoryItems(1);
    fetchCategories();
  }, [fetchInventoryItems, fetchCategories]);

  return {
    inventoryItems,
    pagination,
    categories,
    brands,
    models,
    filterStatus,
    criticalItemCount,
    lowItemCount,
    fetchInventoryItems,
    fetchCategories,
    fetchBrands,
    fetchModels,
    createItem,
    addStock,
    updateItem,
    changeFilter,
  };
}
