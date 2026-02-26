"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getInventoryDropdowns,
  createInventoryItem,
  getInventoryItems,
  addInventoryStock,
  updateInventoryItem,
  createBrand,
  createModel,
} from "@/lib/services/inventory";
import { useDispatch } from "react-redux";
import { startLoading, stopLoading } from "../redux/slice/uiSlice";
import { showToast } from "@/components/ui/toast";
import { getAllClinics } from "../services/dashboard";

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
  const [clinics, setClinics] = useState([]);
  // Current status filter (All | Critical | Low)
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [showTrial, setShowTrial] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");

   useEffect(() => {
     const fetchClinics = async () => {
       try {
         const data = await getAllClinics();
         setClinics(data);
       } catch (error) {
         console.error("Error fetching clinics:", error);
       }
     };

     fetchClinics();
   }, []);

  
  // Fetch inventory items list
 const fetchInventoryItems = useCallback(
  async (page = 1, statusParam, clinicIdParam, typeParam) => {
    const status = statusParam ?? filterStatus;
    const clinicId = clinicIdParam ?? selectedClinic;
    const type = typeParam ?? showTrial;

    try {
      dispatch(startLoading());
      const data = await getInventoryItems({ page, status, clinicId, type });

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
  [dispatch, filterStatus, selectedClinic, showTrial]
);

   // Change active filter and fetch items for that status
  const changeFilter = useCallback(
    async (status) => {
      console.log("show trialll", showTrial)
      setFilterStatus(status);
      await fetchInventoryItems(1, status, selectedClinic, showTrial);
    },
    [fetchInventoryItems, selectedClinic, showTrial]
  );

    const changeClinic = useCallback(
      async (clinicId, type = showTrial) => {
        setSelectedClinic(clinicId);
        await fetchInventoryItems(1, filterStatus, clinicId, type);
      },
      [fetchInventoryItems, filterStatus, showTrial],
    );

    const changeTab = useCallback(
      async (type) => {
        setShowTrial(type);
        await fetchInventoryItems(1, filterStatus, selectedClinic, type);
      },
      [fetchInventoryItems, filterStatus, selectedClinic],
    );

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await getInventoryDropdowns();
      console.log("Categories fetched:", data);
      setCategories(data.categories || []);
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
      console.log("Brands fetched:", data);
      setBrands(data?.brands || []);
      setModels([]); // Reset models when category changes
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  }, []);

  // Fetch models when brand is selected
  const fetchModels = useCallback(async (category, brandIdOrName) => {
    if (!brandIdOrName || !category) {
      setModels([]);
      return;
    }
    try {
      // If brandIdOrName is a number (ID), we need to find the brand name from brands array
      let brandName = brandIdOrName;
      if (typeof brandIdOrName === 'number') {
        const selectedBrand = brands.find(b => b.id === brandIdOrName);
        brandName = selectedBrand?.name || brandIdOrName;
      }
      
      const data = await getInventoryDropdowns({ category, brand: brandName });
      setModels(data?.models || []);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    }
  }, [brands]);

 
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

  // Create new brand
  const createNewBrand = useCallback(
    async (brandName, category) => {
      try {
        dispatch(startLoading());
        const payload = { name: brandName, category };
        const res = await createBrand(payload);
        console.log("Brand created successfully:", res);
        showToast({ type: "success", message: "Brand created successfully" });
        // Refetch brands after creating new brand
        await fetchBrands(category);
        return res;
      } catch (error) {
        console.error("Error creating brand:", error);
        showToast({
          type: "error",
          message: error?.response?.data?.error || "Failed to create brand",
        });
        return null;
      } finally {
        dispatch(stopLoading());
      }
    },
    [dispatch, fetchBrands]
  );

  // Create new model
  const createNewModel = useCallback(
    async (modelName, category, brandId) => {
      try {
        dispatch(startLoading());
        const payload = { name: modelName, category, brand: brandId };
        const res = await createModel(payload);
        console.log("Model created successfully:", res);
        showToast({ type: "success", message: "Model created successfully" });
        await fetchModels(category, brandId);
        return res;
      } catch (error) {
        console.error("Error creating model:", error);
        showToast({
          type: "error",
          message: error?.response?.data?.error || "Failed to create model",
        });
        return null;
      } finally {
        dispatch(stopLoading());
      }
    },
    [dispatch, fetchModels]
  );



  useEffect(() => {
    fetchInventoryItems(1);
    fetchCategories();
  }, [fetchInventoryItems, fetchCategories]);

  return {
    clinics,
    inventoryItems,
    pagination,
    categories,
    brands,
    models,
    filterStatus,
    criticalItemCount,
    lowItemCount,
    selectedClinic, 
    showTrial, 
    setShowTrial,
    changeTab,
    changeClinic,
    setSelectedClinic,
    fetchInventoryItems,
    fetchCategories,
    fetchBrands,
    fetchModels,
    createItem,
    addStock,
    updateItem,
    changeFilter,
    createNewBrand,
    createNewModel,
  };
}
