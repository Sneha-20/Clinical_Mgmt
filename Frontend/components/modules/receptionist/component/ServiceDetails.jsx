"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getTgaServiceDetails,
  updateTgaService,
  getPartsUsed,
} from "@/lib/services/dashboard";
import { showToast } from "@/components/ui/toast";
import TextArea from "@/components/ui/TextArea";
import Backbutton from "@/components/ui/Backbutton";
import Badge from "@/components/ui/badge";
import usePatientData from "@/lib/hooks/usePatientData";

export default function ServiceDetails({ serviceId }) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    action_taken: "",
    parts_used: [],
    charges_collect_for_service: "",
    rtc_date: "",
    gst_charges: "",
  });
  const [partsOptions, setPartsOptions] = useState([]);
  const { fetchSerialsForItem } = usePatientData();

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

  const updatePart = async (index, field, value) => {
    const updatedParts = [...formData.parts_used];

    if (field === "inventory_item_id") {
      const selectedItem = partsOptions.find(opt => opt.inventory_item_id === parseInt(value));
      updatedParts[index] = {
        ...updatedParts[index],
        [field]: value,
        stock_type: selectedItem?.stock_type || "Non-Serialized",
        quantity_in_stock: selectedItem?.quantity_in_stock || 0,
        serial_numbers: [],
        available_serials: [],
        loadingSerials: false,
        stockError: false
      };

      if (selectedItem?.stock_type === "Serialized") {
        updatedParts[index].loadingSerials = true;
        setFormData((prev) => ({ ...prev, parts_used: updatedParts }));

        try {
          const serials = await fetchSerialsForItem(value, true);
          updatedParts[index].available_serials = serials;
          // For serialized, the stock is effectively the count of available serials
          updatedParts[index].quantity_in_stock = serials.length;
        } finally {
          updatedParts[index].loadingSerials = false;
          setFormData((prev) => ({ ...prev, parts_used: [...updatedParts] }));
        }
        return;
      }
    } else if (field === "serial_numbers") {
      updatedParts[index] = {
        ...updatedParts[index],
        [field]: value,
        quantity: value.length
      };
    } else if (field === "quantity") {
      const qty = parseInt(value) || 0;
      const inStock = updatedParts[index].quantity_in_stock || 0;
      updatedParts[index] = {
        ...updatedParts[index],
        [field]: qty,
        stockError: qty > inStock
      };
    } else {
      updatedParts[index] = { ...updatedParts[index], [field]: value };
    }

    setFormData((prev) => ({ ...prev, parts_used: updatedParts }));
  };

  const removePart = (index) => {
    setFormData((prev) => ({
      ...prev,
      parts_used: prev.parts_used.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const hasStockError = formData.parts_used.some(part => part.stockError);
    if (hasStockError) {
      showToast({
        type: "error",
        message: "Insufficient stock for one or more items",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        action_taken: formData.action_taken,
        parts_used: formData.parts_used
          .filter((part) => part.inventory_item_id)
          .map((part) => {
            const base = {
              inventory_item_id: parseInt(part.inventory_item_id),
            };
            if (part.stock_type === "Serialized") {
              return {
                ...base,
                serial_numbers: part.serial_numbers || [],
              };
            }
            return {
              ...base,
              quantity: parseInt(part.quantity) || 1,
            };
          }),
        charges_collect_for_service:
          parseFloat(formData.charges_collect_for_service) || 0,
        rtc_date: formData.rtc_date,
        gst_charges: parseFloat(formData.gst_charges) || 0,
      };

      await updateTgaService(serviceId, payload);
      await fetchServiceDetails();
      setEditing(false);
      showToast({
        type: "success",
        message: "Service details updated successfully",
      });
      if (typeof onServiceUpdated === "function") {
        onServiceUpdated();
      }
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
    <div className="space-y-4 sm:space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between bg-card text-card-foreground rounded-xl border p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <Backbutton />
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">Service Details</h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              ID: {serviceId} • Created on {new Date(service.action_taken_on || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div>
          <Badge status={service.status} title={service.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Service Information */}
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 border-b">
              <h3 className="text-sm font-semibold text-slate-800">
                Service Information
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs text-slate-600">Patient Name</label>
                <div className="text-sm font-medium">{service.patient_name}</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600">Phone Number</label>
                <div className="text-sm">{service.phone_primary}</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600">Service Type</label>
                <div className="text-sm capitalize">{service.service_type?.replace('_', ' ')}</div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-600">Action Taken On</label>
                <div className="text-sm">
                  {service.action_taken_on
                    ? new Date(service.action_taken_on).toLocaleString()
                    : "Not yet"}
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-slate-600">Complaint</label>
                <div className="text-sm bg-slate-50 p-3 rounded-lg border">
                  {service.complaint || "No complaint recorded"}
                </div>
              </div>
            </div>
          </div>

          {/* Device Information */}
          {service.device_info && (
            <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-100 border-b">
                <h3 className="text-sm font-semibold text-slate-800">
                  Device Information
                </h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs text-slate-600 block">Product</label>
                  <span className="text-sm font-medium">{service.device_info.product_name}</span>
                </div>
                <div>
                  <label className="text-xs text-slate-600 block">Brand / Model</label>
                  <span className="text-sm">{service.device_info.brand} {service.device_info.model}</span>
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Serial Number</label>
                  <Badge title={service.device_info.serial_number} />
                </div>
              </div>
            </div>
          )}

          {/* Service Actions & Parts */}
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-100 border-b flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-800">
                Service Actions & Parts
              </h3>
              <div className="flex space-x-2">
                {editing ? (
                  <>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={loading} className="bg-red-600 text-white hover:bg-red-700">
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  service?.status !== "Service Completed" && service?.status !== "Completed with payment" && (
                    <Button size="sm" onClick={() => setEditing(true)} className="bg-red-600 text-white hover:bg-red-700">
                      Update Service
                    </Button>
                  )
                )}
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs text-slate-600 block mb-2">Action Taken</label>
                {editing ? (
                  <TextArea
                    className="w-full border rounded-lg p-3 text-sm"
                    rows={3}
                    value={formData.action_taken}
                    onChange={(e) => updateField("action_taken", e.target.value)}
                    placeholder="Describe the action taken..."
                  />
                ) : (
                  <div className="text-sm text-slate-800 whitespace-pre-wrap">
                    {service.action_taken || "No action recorded yet"}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="text-xs text-slate-600 block">Parts Used</label>
                {editing ? (
                  <div className="space-y-3">
                    {formData.parts_used.map((part, index) => (
                      <div key={index} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition-all hover:border-slate-300">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-grow space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                              <div className="w-full">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                                  Select Part {index + 1}
                                </label>
                                <select
                                  className="block w-full border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 text-sm h-[44px] bg-white transition-all"
                                  value={part.inventory_item_id}
                                  onChange={(e) =>
                                    updatePart(index, "inventory_item_id", e.target.value)
                                  }
                                >
                                  <option value="">Choose an inventory item...</option>
                                  {partsOptions.map((option) => (
                                    <option
                                      key={option.inventory_item_id}
                                      value={option.inventory_item_id}
                                    >
                                      {option.product_name} - {option.brand} (₹{option.unit_price})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {part.stock_type !== "Serialized" && part.inventory_item_id && (
                                <div className="w-full sm:w-32">
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                                    Quantity (In Stock: {part.quantity_in_stock || 0})
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="Qty"
                                    value={part.quantity}
                                    onChange={(e) =>
                                      updatePart(
                                        index,
                                        "quantity",
                                        e.target.value,
                                      )
                                    }
                                    className={`rounded-lg border-slate-200 h-[44px] focus:ring-red-100 focus:border-red-600 ${part.stockError ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                                  />
                                  {part.stockError && (
                                    <span className="text-[10px] text-red-500 font-medium mt-1 block animate-pulse">
                                      Insufficient stock
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {part.loadingSerials && (
                              <div className="flex items-center space-x-2 text-xs text-slate-500 py-2">
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Fetching available serial numbers...</span>
                              </div>
                            )}

                            {part.stock_type === "Serialized" && !part.loadingSerials && part.inventory_item_id && (
                              <div className="space-y-2 pt-2 border-t border-slate-50">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
                                  <span>Serial Number Assignment</span>
                                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                    Items: {part.quantity || 0}
                                  </span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-3 bg-slate-50/50">
                                  {part.available_serials && part.available_serials.length > 0 ? (
                                    part.available_serials.map((serial) => (
                                      <div
                                        key={serial.value}
                                        className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${(part.serial_numbers || []).includes(serial.value)
                                          ? 'bg-red-50 border border-red-200'
                                          : 'bg-white border border-slate-200 hover:border-slate-300'
                                          }`}
                                      >
                                        <input
                                          type="checkbox"
                                          id={`serial-${index}-${serial.value}`}
                                          checked={(part.serial_numbers || []).includes(serial.value)}
                                          onChange={(e) => {
                                            const current = part.serial_numbers || [];
                                            if (e.target.checked) {
                                              updatePart(index, "serial_numbers", [...current, serial.value]);
                                            } else {
                                              updatePart(index, "serial_numbers", current.filter(s => s !== serial.value));
                                            }
                                          }}
                                          className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                                        />
                                        <label htmlFor={`serial-${index}-${serial.value}`} className="text-xs font-medium text-slate-700 cursor-pointer flex-grow">
                                          {serial.label}
                                        </label>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="col-span-full py-4 text-center">
                                      <p className="text-xs text-slate-400 italic">No available serial numbers found for this product.</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex sm:items-start pt-6 sm:pt-0">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => removePart(index)}
                              className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 h-[44px] w-full sm:w-auto"
                            >
                              <span className="text-2xl leading-none">×</span>
                            </Button>
                          </div>
                        </div>
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
                  <div className="space-y-3">
                    {service.parts_used && service.parts_used.length > 0 ? (
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="w-full text-xs sm:text-sm">
                          <thead className="bg-slate-100 border-b">
                            <tr>
                              <th className="py-2 px-3 text-left">Part Name</th>
                              <th className="py-2 px-3 text-left">Brand/Model</th>
                              <th className="py-2 px-3 text-left">Quantity</th>
                              <th className="py-2 px-3 text-right">Total Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {service.parts_used.map((part, index) => (
                              <tr key={index} className="border-b hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-3">
                                  <div className="flex flex-col gap-1">
                                    <span className="font-medium text-slate-900">{part.inventory_item_name}</span>
                                    {part.stock_type === "Serialized" && (
                                      <div className="flex">
                                        <Badge title={`S/N: ${part.serial_number}`} />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-slate-600">
                                  {part.inventory_item_brand} {part.inventory_item_model || ""}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
                                    {part.quantity} unit{part.quantity > 1 ? 's' : ''}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-semibold">
                                  ₹{part.total_cost?.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic py-2">No parts used in this service</div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">Service Fee</label>
                  {editing ? (
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.charges_collect_for_service}
                      onChange={(e) =>
                        updateField("charges_collect_for_service", e.target.value)
                      }
                      className="h-9"
                    />
                  ) : (
                    <div className="text-sm font-semibold">
                      ₹{parseFloat(service.charges_collected || 0).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">GST Charge</label>
                  {editing ? (
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={formData.gst_charges}
                      onChange={(e) => updateField("gst_charges", e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <div className="text-sm font-semibold">
                      ₹{parseFloat(service.gst_charges || 0).toFixed(2)}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-600">RTC Date</label>
                  {editing ? (
                    <Input
                      type="date"
                      value={formData.rtc_date}
                      onChange={(e) => updateField("rtc_date", e.target.value)}
                      className="h-9"
                    />
                  ) : (
                    <div className="text-sm">
                      {service.rtc_date ? new Date(service.rtc_date).toLocaleDateString() : "Not set"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Cost Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card text-card-foreground rounded-xl border shadow-sm sticky top-6">
            <div className="px-6 py-4 bg-slate-100 border-b">
              <h3 className="text-sm font-semibold text-slate-800">Payment Summary</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Parts Total</span>
                <span className="font-medium">₹{service.total_parts_cost?.toFixed(2) || "0.00"}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Service Fee</span>
                <span className="font-medium">₹{service.total_service_cost?.toFixed(2) || "0.00"}</span>
              </div>

              <div className="flex justify-between items-center text-sm border-b pb-4">
                <span className="text-slate-600">GST</span>
                <span className="font-medium">₹{service.gst_charges?.toFixed(2) || "0.00"}</span>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Grand Total</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-red-600">
                      ₹{service.grand_total?.toFixed(2) || "0.00"}
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
