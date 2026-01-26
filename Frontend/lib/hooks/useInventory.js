"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getInventoryDropdowns,
  createInventoryItem,
  getInventoryItems,
  addInventoryStock,
} from "@/lib/services/inventory";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";

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

  // Fetch inventory items list
  const fetchInventoryItems = useCallback(
    async (page = 1) => {
      try {
        dispatch(startLoading());
        const data = await getInventoryItems({ page });
        setInventoryItems(data.items || []);
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
    [dispatch]
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

  // Create inventory item
  const createItem = useCallback(
    async (itemData) => {
      try {
        dispatch(startLoading());
        await createInventoryItem(itemData);
        showToast({ type: "success", message: "Inventory item created successfully" });
        await fetchInventoryItems(pagination.currentPage);
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
    [dispatch, fetchInventoryItems, pagination]
  );

  // Add stock to inventory item
  const addStock = useCallback(
    async (stockData) => {
      try {
        dispatch(startLoading());
        await addInventoryStock(stockData);
        showToast({ type: "success", message: "Stock added successfully" });
        await fetchInventoryItems(pagination.currentPage);
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
    [dispatch, fetchInventoryItems, pagination]
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
    fetchInventoryItems,
    fetchCategories,
    fetchBrands,
    fetchModels,
    createItem,
    addStock,
  };
}
