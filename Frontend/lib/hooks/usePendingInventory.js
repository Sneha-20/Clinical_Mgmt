import { useCallback, useEffect, useState } from "react";
import {
  getPendingInventoryItems,
  approvePendingInventoryItem,
} from "../services/inventory";
import { getAllClinics } from "../services/dashboard";

export default function usePendingInventory() {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("All");

  /**
   * Stable function using useCallback
   * Always uses latest clinicId
   */
  const fetchPendingProducts = useCallback(async (clinicId) => {
    setLoading(true);
    try {
      const data = await getPendingInventoryItems({
        clinic_id: clinicId ?? selectedClinic,
      });
      setPendingProducts(data || []);
    } catch (error) {
      console.error("Error fetching pending products:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedClinic]);

  /**
   * Runs whenever selectedClinic changes
   */
  useEffect(() => {
    fetchPendingProducts(selectedClinic);
  }, [selectedClinic, fetchPendingProducts]);

  /**
   * Change clinic
   * Don't call fetch manually to avoid duplicate calls
   */
  const changeClinic = useCallback((clinicId) => {
    console.log("Changing clinic to", clinicId);
    setSelectedClinic(clinicId);
  }, []);

  /**
   * Approve product and refresh list
   */
  const approveProduct = useCallback(async (id) => {
    setApprovingId(id);
    try {
      await approvePendingInventoryItem(id);

      // refresh using latest clinic
      await fetchPendingProducts(selectedClinic);

    } catch (error) {
      console.error("Error approving product:", error);
    } finally {
      setApprovingId(null);
    }
  }, [fetchPendingProducts, selectedClinic]);

  /**
   * Fetch clinics once
   */
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const data = await getAllClinics();
        const filterClinics = data.filter(clinic => clinic.is_main_inventory !== true);
        setClinics(filterClinics);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    };

    fetchClinics();
  }, []);

  return {
    pendingProducts,
    loading,
    approvingId,
    clinics,
    selectedClinic,
    changeClinic,
    setSelectedClinic,
    setClinics,
    fetchPendingProducts,
    approveProduct,
  };
}