"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DropDown from "@/components/ui/dropdown";
import Modal from "@/components/ui/Modal";
import CommonCheckbox from "@/components/ui/CommonCheckbox";

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
  categories = [],
  brands = [],
  models = [],
  onCategoryChange,
  onBrandChange,
  loading = false,
}) {
  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    model_type: "",
    product_name: "",
    description: "",
    location: "",
    unit_price: "",
    use_in_trial: false,
    stock_type: false,
    serial_numbers: "",
  });

  // Prefill when editing
  useEffect(() => {
    if (isOpen && isEdit && initialData) {
      setFormData({
        category: initialData.category || "",
        brand: initialData.brand || "",
        model_type: initialData.model_type || "",
        product_name: initialData.product_name || "",
        description: initialData.description || "",
        location: initialData.location || "",
        unit_price: initialData.unit_price || "",
        use_in_trial: initialData.use_in_trial || false,
        stock_type: initialData.stock_type === "Serialized",
        serial_numbers: "",
      });

      // Ensure dropdowns are populated for the current category/brand
      if (initialData.category) {
        onCategoryChange?.(initialData.category);
      }
      if (initialData.category && initialData.brand) {
        onBrandChange?.(initialData.category, initialData.brand);
      }
    }
  }, [isOpen, isEdit, initialData, onCategoryChange, onBrandChange]);

  const [errors, setErrors] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        category: "",
        brand: "",
        model_type: "",
        product_name: "",
        description: "",
        location: "",
        unit_price: "",
        use_in_trial: false,
        stock_type: false,
        serial_numbers: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  // Fetch brands when category changes
  useEffect(() => {
    if (formData.category) {
      onCategoryChange?.(formData.category);
      setFormData((prev) => ({ ...prev, brand: "", model_type: "" }));
    }
  }, [formData.category, onCategoryChange]);

  // Fetch models when brand changes
  useEffect(() => {
    if (formData.brand && formData.category) {
      onBrandChange?.(formData.category, formData.brand);
      setFormData((prev) => ({ ...prev, model_type: "" }));
    }
  }, [formData.brand, formData.category, onBrandChange]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Debug: confirm submit fired and current form state
    console.log("AddProductModal: handleSubmit called", { isEdit, formData });

    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.brand) newErrors.brand = "Brand is required";
    if (!formData.model_type) newErrors.model_type = "Model is required";
    if (!formData.product_name) newErrors.product_name = "Product name is required";
    if (!formData.location) newErrors.location = "Location is required";
    if (!formData.unit_price) newErrors.unit_price = "Unit price is required";

    // Require serial numbers only when creating a serialized product (not when editing)
    if (formData.stock_type && !isEdit && !formData.serial_numbers) {
      newErrors.serial_numbers = "Serial numbers are required for serialized items";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("AddProductModal: validation failed", newErrors);
      return;
    }

    // Prepare payload
    const payload = {
      category: formData.category,
      product_name: formData.product_name,
      brand: formData.brand,
      model_type: formData.model_type,
      description: formData.description || "",
      stock_type: formData.stock_type ? "Serialized" : "Non-Serialized",
      location: formData.location,
      unit_price: formData.unit_price,
      use_in_trial: formData.use_in_trial,
    };

    // Add serial numbers if stock type is serialized and we are creating (not editing)
    if (!isEdit && formData.stock_type && formData.serial_numbers) {
      payload.serial_numbers = formData.serial_numbers
        .split(",")
        .map((sn) => sn.trim())
        .filter((sn) => sn.length > 0);
    }

    console.log("AddProductModal: calling onSubmit with payload", payload);
    if (!onSubmit || typeof onSubmit !== 'function') {
      console.error('AddProductModal: onSubmit is not a function or undefined', onSubmit);
      return;
    }

    onSubmit(payload);
  };

  const categoryOptions = categories.map((cat) => ({
    label: cat,
    value: cat,
  }));

  const brandOptions = brands.map((brand) => ({
    label: brand,
    value: brand,
  }));

  const modelOptions = models.map((model) => ({
    label: model,
    value: model,
  }));

  return (
    <Modal
      isModalOpen={isOpen}
      onClose={onClose}
      header={isEdit ? `Edit Product - ${initialData?.product_name || ""}` : "Add New Product"}
      showButton={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DropDown
            label="Category"
            name="category"
            options={categoryOptions}
            value={formData.category}
            onChange={updateField}
            placeholder="Select category"
            error={errors.category}
            important
          />

          <DropDown
            label="Brand"
            name="brand"
            options={brandOptions}
            value={formData.brand}
            onChange={updateField}
            placeholder="Select brand"
            error={errors.brand}
            isDisabled={!formData.category}
            important
          />

          <DropDown
            label="Model"
            name="model_type"
            options={modelOptions}
            value={formData.model_type}
            onChange={updateField}
            placeholder="Select model"
            error={errors.model_type}
            isDisabled={!formData.brand}
            important
          />

          <Input
            label="Product Name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            placeholder="Enter product name"
            error={errors.product_name}
            important
          />

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
            error={errors.location}
            important
          />

          <Input
            label="Unit Price"
            name="unit_price"
            type="number"
            step="0.01"
            value={formData.unit_price}
            onChange={handleChange}
            placeholder="Enter price"
            error={errors.unit_price}
            important
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description (optional)"
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
            <input
              id="use_in_trial"
              name="use_in_trial"
              type="checkbox"
              checked={formData.use_in_trial}
              onChange={handleChange}
              className="hidden"
            />
            <div
              className={`h-4 w-4 rounded-sm border flex items-center justify-center transition-all ${
                formData.use_in_trial ? "bg-[#1ba9c6] border-[#1ba9c6]" : "border-gray-400"
              }`}
            >
              {formData.use_in_trial && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>Use in Trial</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
            <input
              id="stock_type"
              name="stock_type"
              type="checkbox"
              checked={formData.stock_type}
              onChange={handleChange}
              className="hidden"
            />
            <div
              className={`h-4 w-4 rounded-sm border flex items-center justify-center transition-all ${
                formData.stock_type ? "bg-[#1ba9c6] border-[#1ba9c6]" : "border-gray-400"
              }`}
            >
              {formData.stock_type && (
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span>Serialized Stock (Check if product has serial numbers)</span>
          </label>
        </div>

        {formData.stock_type && !isEdit && (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Serial Numbers (comma-separated) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="serial_numbers"
              value={formData.serial_numbers}
              onChange={handleChange}
              placeholder="Enter serial numbers separated by commas (e.g., SN001, SN002, SN003)"
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.serial_numbers && (
              <p className="text-red-500 text-xs mt-1">{errors.serial_numbers}</p>
            )}
          </div>
        )}

        {formData.stock_type && isEdit && (
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-600">Serial numbers are managed via the <strong>Add Stock</strong> modal. Use Add Stock to add serials for serialized products.</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Product" : "Create Product")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
