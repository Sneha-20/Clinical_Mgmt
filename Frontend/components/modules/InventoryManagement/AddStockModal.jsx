"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/Modal";
import { getInventorySerialList } from "@/lib/services/inventory";
import TextArea from '@/components/ui/TextArea'

export default function AddStockModal({
  isOpen,
  onClose,
  onSubmit,
  item,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    serial_numbers: "",
    quantity_in_stock: "",
  });
  const [errors, setErrors] = useState({});
  const [serialList, setSerialList] = useState([]);

  const isSerialized = item?.stock_type === "Serialized";

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        serial_numbers: "",
        quantity_in_stock: "",
      });
      setErrors({});
      setSerialList([]);
    }

    // Fetch current serials when opening modal for a serialized item
    const fetchSerials = async () => {
      if (isOpen && item && item.stock_type === "Serialized") {
        try {
          const res = await getInventorySerialList({ inventory_item: item.id });
          // Response shape may vary; prefer array in res.data or res?.data?.results
          const list = res?.data || res?.data?.results || [];
          setSerialList(list);
        } catch (err) {
          console.error("Error fetching serials:", err);
          setSerialList([]);
        }
      }
    };

    fetchSerials();
  }, [isOpen, item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (isSerialized) {
      if (!formData.serial_numbers) {
        newErrors.serial_numbers = "Serial numbers are required";
      }
    } else {
      if (!formData.quantity_in_stock) {
        newErrors.quantity_in_stock = "Quantity is required";
      }
      if (formData.quantity_in_stock && parseFloat(formData.quantity_in_stock) <= 0) {
        newErrors.quantity_in_stock = "Quantity must be greater than 0";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      inventory_item_id: item.id,
    };

    if (isSerialized) {
      payload.serial_numbers = formData.serial_numbers
        .split(",")
        .map((sn) => sn.trim())
        .filter((sn) => sn.length > 0);
    } else {
      payload.quantity_in_stock = parseInt(formData.quantity_in_stock);
    }

    onSubmit(payload);
  };

  return (
    <Modal
      isModalOpen={isOpen}
      onClose={onClose}
      header={`Add Stock - ${item?.product_name || ""}`}
      showButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="mb-4 p-3 bg-slate-50 rounded-md">
          <p className="text-sm text-slate-600">
            <strong>Stock Type:</strong> {item?.stock_type || "N/A"}
          </p>
          <p className="text-sm text-slate-600">
            <strong>Current Stock:</strong> {item?.quantity_in_stock || 0}
          </p>
        </div>

        {isSerialized ? (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Serial Numbers (comma-separated) <span className="text-red-500">*</span>
            </label>
            <TextArea
              name="serial_numbers"
              value={formData.serial_numbers}
              onChange={handleChange}
              placeholder="Enter serial numbers separated by commas (e.g., SN001, SN002, SN003)"
              rows={4}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.serial_numbers && (
              <p className="text-red-500 text-xs mt-1">{errors.serial_numbers}</p>
            )}

            <div className="mt-3">
              <p className="text-sm font-medium">Existing Serials</p>
              {serialList.length === 0 ? (
                <p className="text-xs text-muted-foreground">No serials found for this item</p>
              ) : (
                <ul className="mt-2 max-h-40 overflow-auto flex items-center">
                  {serialList.map((s, idx) => (
                    <li key={idx} className="text-xs bg-slate-50 px-2 py-1 rounded-md">
                      {s.serial_number ?? s.serial ?? JSON.stringify(s)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div>
            <Input
              label="Quantity to Add"
              name="quantity_in_stock"
              type="number"
              min="1"
              value={formData.quantity_in_stock}
              onChange={handleChange}
              placeholder="Enter quantity"
              error={errors.quantity_in_stock}
              important
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Stock"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
