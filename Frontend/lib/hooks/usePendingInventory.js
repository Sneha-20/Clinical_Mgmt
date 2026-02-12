import { useCallback, useState } from 'react';
import { getPendingInventoryItems, approvePendingInventoryItem } from '../services/inventory';

export default function usePendingInventory() {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);

  const fetchPendingProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPendingInventoryItems({ clinic_id: 4 });
      setPendingProducts(data || []);
    } catch (error) {
      // handle error
    }
    setLoading(false);
  }, []);

  

  const approveProduct = useCallback(async (id) => {
    setApprovingId(id);
    try {
      await approvePendingInventoryItem(id);
      await fetchPendingProducts();
    } catch (error) {
      // handle error
    }
    setApprovingId(null);
  }, [fetchPendingProducts]);

  return {
    pendingProducts,
    loading,
    approvingId,
    fetchPendingProducts,
    approveProduct,
  };
}
