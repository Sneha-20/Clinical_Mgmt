"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DropDown from "@/components/ui/dropdown";
import { getTgaServiceDetails, updateTgaService, getPartsUsed } from "@/lib/services/dashboard";
import { showToast } from "@/components/ui/toast";
import { tgaServiceStatusOptions } from "@/lib/utils/constants/staticValue";
import { routes } from "@/lib/utils/constants/route";
import TextArea from '@/components/ui/TextArea'

export default function ServiceDetails({ serviceId, onBack, onServiceUpdated }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    action_taken: "",
    parts_used: [],
    charges_collect_for_service: "",
    rtc_date: "",
  });
  const [partsOptions, setPartsOptions] = useState([]);

  useEffect(() => {
    fetchServiceDetails();
    fetchPartsOptions();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    setLoading(true);
    try {
      const data = await getTgaServiceDetails(serviceId);
      setService(data);
      setFormData({
        action_taken: data.action_taken || "",
        parts_used: data.parts_used || [],
        charges_collect_for_service: data.charges_collected || "",
        rtc_date: data.rtc_date || "",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch service details",
      });
      console.error("Service details fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartsOptions = async () => {
    try {
      const data = await getPartsUsed();
      setPartsOptions(data);
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch parts options",
      });
      console.error("Parts options fetch error:", error);
    }
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts_used: [...prev.parts_used, { inventory_item_id: "", quantity: 1 }],
    }));
  };

  const updatePart = (index, field, value) => {
    const updatedParts = [...formData.parts_used];
    updatedParts[index] = { ...updatedParts[index], [field]: value };
    setFormData((prev) => ({ ...prev, parts_used: updatedParts }));
  };

  const removePart = (index) => {
    setFormData((prev) => ({
      ...prev,
      parts_used: prev.parts_used.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        action_taken: formData.action_taken,
        parts_used: formData.parts_used.filter(part => part.inventory_item_id),
        charges_collect_for_service: parseFloat(formData.charges_collect_for_service) || 0,
        rtc_date: formData.rtc_date,
      };

      await updateTgaService(serviceId, payload);
      setService({ ...service, ...payload });
      setEditing(false);
      showToast({
        type: "success",
        message: "Service details updated successfully",
      });
      onServiceUpdated();
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to update service details",
      });
      console.error("Service update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      action_taken: service?.action_taken || "",
      parts_used: service?.parts_used || [],
      charges_collect_for_service: service?.charges_collected || "",
      rtc_date: service?.rtc_date || "",
    });
    setEditing(false);
  };

  if (loading && !service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading service details...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Service not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            ← Back to List
          </Button>
          <div>
            {/* <h2 className="text-xl font-semibold text-gray-900">
              Service Request #{service.service_id}
            </h2> */}
            <p className="text-gray-600">
              Created on {new Date(service.action_taken_on).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Update Service</Button>
          )}
        </div>
      </div>

      {/* Service Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <div className="text-gray-900">{service.patient_name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="text-gray-900">{service.phone_primary}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <div className="text-gray-900">{service.service_type}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="text-gray-900">{service.status}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complaint
            </label>
            <div className="text-gray-900">{service.complaint}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Taken On
            </label>
            <div className="text-gray-900">
              {service.action_taken_on ? new Date(service.action_taken_on).toLocaleDateString() : "Not yet"}
            </div>
          </div>
        </div>
      </div>

      {/* Device Information */}
      {service.device_info && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <div className="text-gray-900">{service.device_info.product_name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <div className="text-gray-900">{service.device_info.brand}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <div className="text-gray-900">{service.device_info.model}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Serial Number
              </label>
              <div className="text-gray-900">{service.device_info.serial_number}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <div className="text-gray-900">
                {service.device_info.purchase_date 
                  ? new Date(service.device_info.purchase_date).toLocaleDateString() 
                  : "Not available"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cost Summary */}
      {(service.total_parts_cost || service.total_service_cost || service.grand_total) && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cost Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Parts Cost
              </label>
              <div className="text-lg font-semibold text-gray-900">
                ${service.total_parts_cost?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Service Cost
              </label>
              <div className="text-lg font-semibold text-gray-900">
                ${service.total_service_cost?.toFixed(2) || "0.00"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grand Total
              </label>
              <div className="text-lg font-bold text-blue-600">
                ${service.grand_total?.toFixed(2) || "0.00"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Update Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Service Update</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action Taken
            </label>
            {editing ? (
              <TextArea
                className="w-full border border-gray-300 rounded-md p-2"
                rows={4}
                value={formData.action_taken}
                onChange={(e) => updateField("action_taken", e.target.value)}
                placeholder="Describe the action taken..."
              />
            ) : (
              <div className="text-gray-900 whitespace-pre-wrap">
                {service.action_taken || "No action taken yet"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parts Used
            </label>
            {editing ? (
              <div className="space-y-3">
                {formData.parts_used.map((part, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <select
                      className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={part.inventory_item_id}
                      onChange={(e) =>
                        updatePart(index, "inventory_item_id", e.target.value)
                      }
                    >
                      <option value="">Select a part</option>
                      {partsOptions.map((option) => (
                        <option key={option.inventory_item_id} value={option.inventory_item_id}>
                          {option.product_name} - {option.brand} ({option.model_type}) - ₹{option.unit_price}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={part.quantity}
                      onChange={(e) => updatePart(index, "quantity", parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removePart(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPart}
                  className="mt-2"
                >
                  + Add Part
                </Button>
              </div>
            ) : (
              <div className="text-gray-900">
                {service.parts_used && service.parts_used.length > 0 ? (
                  <div className="space-y-3">
                    {service.parts_used.map((part, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Part Name:</span>
                            <div className="text-gray-900">{part.inventory_item_name}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Brand/Model:</span>
                            <div className="text-gray-900">
                              {part.inventory_item_brand} {part.inventory_item_model}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Quantity:</span>
                            <div className="text-gray-900">{part.quantity}</div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Total Cost:</span>
                            <div className="text-gray-900">${part.total_cost?.toFixed(2)}</div>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          Inventory Item ID: {part.inventory_item_id} | Part ID: {part.part_id}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  "No parts used"
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charges Collected for Service
              </label>
              {editing ? (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.charges_collect_for_service}
                  onChange={(e) => updateField("charges_collect_for_service", e.target.value)}
                />
              ) : (
                <div className="text-gray-900">
                  ${service.charges_collect_for_service || "0.00"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RTC Date
              </label>
              {editing ? (
                <Input
                  type="date"
                  value={formData.rtc_date}
                  onChange={(e) => updateField("rtc_date", e.target.value)}
                />
              ) : (
                <div className="text-gray-900">
                  {service.rtc_date || "Not set"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
