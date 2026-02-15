import { useState, useEffect } from 'react';
import { GetClinicDropdowns, GetInventoryDropdowns } from '@/lib/services/dashboard';
import { apiClient } from '@/lib/api';
import { showToast } from '@/components/ui/toast';
import { getInventorySerialList } from '@/lib/services/inventory';

export default function useTransferProducts() {
  const [toClinicId, setToClinicId] = useState('');
  const [notes, setNotes] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [tempQuantity, setTempQuantity] = useState(1);
  const [tempSerialInput, setTempSerialInput] = useState('');
  const [tempSerials, setTempSerials] = useState([]);
  const [availableSerials, setAvailableSerials] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [clinicsData, inventoryData] = await Promise.all([
          GetClinicDropdowns(),
          GetInventoryDropdowns(),
        ]);
        setClinics(clinicsData || []);
        setInventoryItems(inventoryData || []);
      } catch (err) {
        console.error('fetch transfer dropdowns', err);
        showToast({ type: 'error', message: 'Failed to load dropdowns' });
      }
    };
    fetch();
  }, []);
  
  const selectedItem = inventoryItems.find((i) => i.id === Number(selectedItemId));
  const addTempSerial = () => {
    const sn = tempSerialInput?.trim();
    if (!sn) return;
    if (tempSerials.includes(sn)) {
      showToast({ type: 'error', message: 'Serial already added.' });
      return;
    }
    setTempSerials((s) => [...s, sn]);
    setTempSerialInput('');
  };

  const removeTempSerial = (sn) => setTempSerials((s) => s.filter((x) => x !== sn));

  const addProduct = () => {
    if (!selectedItemId) return;
    const item = inventoryItems.find((i) => i.id === Number(selectedItemId));
    if (!item) return;
    if (products.find((p) => p.item.id === item.id)) {
      showToast({ type: 'error', message: 'Product already added.' });
      return;
    }

    if (item.stock_type === 'Serialized') {
      if (!tempSerials || tempSerials.length === 0) {
        showToast({ type: 'error', message: 'Please add at least one serial number.' });
        return;
      }
      setProducts((p) => [...p, { item, quantity: 0, selectedSerials: tempSerials }]);
    } else {
      if (!tempQuantity || Number(tempQuantity) < 1) {
        showToast({ type: 'error', message: 'Please enter a valid quantity.' });
        return;
      }
      const qty = Math.min(Number(tempQuantity), item.stock ?? Number.MAX_SAFE_INTEGER);
      setProducts((p) => [...p, { item, quantity: qty, selectedSerials: [] }]);
    }

    // reset temp
    setSelectedItemId('');
    setTempQuantity(1);
    setTempSerialInput('');
    setTempSerials([]);
  };

  const removeProduct = (id) => setProducts((p) => p.filter((x) => x.item.id !== id));

  const updateQuantity = (id, delta) => {
    setProducts((p) => p.map((pr) => {
      if (pr.item.id !== id) return pr;
      // const newQty = Math.max(1, Math.min(pr.item.stock, pr.quantity + delta));
      const newQty = Math.max(1, pr.quantity + delta);
      return { ...pr, quantity: newQty };
    }));
  };

  const setProductQuantity = (id, value) => {
    setProducts((p) => p.map((pr) => (pr.item.id !== id ? pr : { ...pr, quantity: Math.max(1, Math.min(pr.item.stock ?? Number.MAX_SAFE_INTEGER, Number(value))) })));
  };

  const toggleSerial = (productId, serial) => {
    setProducts((p) => p.map((pr) => {
      if (pr.item.id !== productId) return pr;
      const selected = pr.selectedSerials.includes(serial)
        ? pr.selectedSerials.filter((s) => s !== serial)
        : [...pr.selectedSerials, serial];
      return { ...pr, selectedSerials: selected };
    }));
  };

      const fetchSerials = async (product) => {
        if (product && product.stock_type === "Serialized") {
          try {
            const res = await getInventorySerialList({ inventory_item: product.id });
            const list = res?.data || res?.data?.results || [];
            // normalize to array of serial strings if objects provided
            const serials = Array.isArray(list)
              ? list.map((it) => (typeof it === 'string' ? it : it.serial_number || it.sn || it.name || String(it))).filter(Boolean)
              : [];
            setAvailableSerials(serials);
          } catch (err) {
            console.error("Error fetching serials:", err);
          }
        }
      };

    // when selected item changes, clear temp serials/input and fetch available serials
    useEffect(() => {
      setAvailableSerials([]);
      setTempSerials([]);
      setTempSerialInput('');
      if (selectedItem && selectedItem.stock_type === 'Serialized') {
        fetchSerials(selectedItem);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedItemId]);

    const toggleAvailableSerial = (sn) => {
      setTempSerials((prev) => (prev.includes(sn) ? prev.filter((s) => s !== sn) : [...prev, sn]));
    };

  const handleSubmit = async () => {
    console.log('Submitting transfer', { toClinicId, products });
    if (!toClinicId || products.length === 0) {
      showToast({ type: 'error', message: 'Please select a destination clinic and add at least one product.' });
      return;
    }

    const payload = {
      to_clinic_id: Number(toClinicId),
      notes,
      products: products.map((p) => {
        if (p.item.stock_type === 'Serialized') {
          return { source_inventory_id: p.item.id, serial_numbers: p.selectedSerials };
        }
        return { source_inventory_id: p.item.id, quantity: p.quantity };
      }),
    };

    setSubmitting(true);
    try {
      const res = await apiClient.post('clinical/inventory/transfer/', payload);
      showToast({ type: 'success', message: res?.message || 'Transfer submitted successfully!' });
      setToClinicId('');
      setNotes('');
      setProducts([]);
    } catch (error) {
      console.error('Transfer API error', error);
      const msg = error?.response?.data?.error || error?.message || 'Failed to submit transfer.';
      showToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    toClinicId,
    setToClinicId,
    notes,
    setNotes,
    products,
    selectedItemId,
    setSelectedItemId,
    tempQuantity,
    setTempQuantity,
    tempSerialInput,
    setTempSerialInput,
    tempSerials,
    addTempSerial,
    removeTempSerial,
    addProduct,
    removeProduct,
    updateQuantity,
    setProductQuantity,
    toggleSerial,
    handleSubmit,
    clinics,
    inventoryItems,
    selectedItem,
    submitting,
    availableSerials,
    toggleAvailableSerial,
  };
}
