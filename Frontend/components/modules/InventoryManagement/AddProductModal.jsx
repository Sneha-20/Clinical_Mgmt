"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextArea from "@/components/ui/TextArea";
import DropDown from "@/components/ui/dropdown";
import Modal from "@/components/ui/Modal";
import CommonCheckbox from "@/components/ui/CommonCheckbox";
import {
  accessoriesTypeOptions,
  diagnosticCoreProducts,
  diagnosticAccessoryProducts,
  speechPediatricProducts,
  speechAdultProducts,
  accessoriesDomesProducts,
  accessoriesReceiversProducts,
  accessoriesTubingProducts,
  accessoriesFiltersProducts,
  accessoriesCleaningProducts,
  accessoriesBatteriesProducts,
  accessoriesRechargeableProducts,
} from "@/lib/utils/constants/staticValue";

export default function AddProductModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isEdit = false,
  categories = [],
  brands = [],
  models = [],
  cochlearAccessories = [],
  ageGroups = [],
  onCategoryChange,
  onBrandChange,
  onCreateBrand,
  onCreateModel,
  loading = false,
}) {
  console.log("hgkh", initialData);
  const [formData, setFormData] = useState({
    category: "",
    accessories_type: "",
    age_group: "",
    brand: "",
    model_type: "",
    product_name: "",
    description: "",
    location: "",
    unit_price: "",
    gst_value: "",
    use_in_trial: false,
    stock_type: false,
    serial_numbers: "",
    quantity_in_stock: "",
    reorder_level: 10,
  });

  const [showAddBrand, setShowAddBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [showAddModel, setShowAddModel] = useState(false);
  const [newModelName, setNewModelName] = useState("");
  const [creatingBrand, setCreatingBrand] = useState(false);
  const [creatingModel, setCreatingModel] = useState(false);

  const [hasPrefilled, setHasPrefilled] = useState(false);

  const isDiagnostic = !!formData.category?.toLowerCase().includes("diagnostic");
  const isSpeech = !!formData.category?.toLowerCase().includes("speech");

  const selectedModelName = models.find(m => m.id === formData.model_type)?.name || formData.model_type;

  const getDiagnosticProductOptions = () => {
    if (selectedModelName?.toLowerCase().includes("core")) {
      return diagnosticCoreProducts;
    }
    if (selectedModelName?.toLowerCase().includes("Hearing Aids Accessories")) {
      return diagnosticAccessoryProducts;
    }
    return [];
  };

  const getSpeechProductOptions = () => {
    const ageGroup = formData.age_group?.toLowerCase();
    if (ageGroup?.includes("pediatric")) {
      return speechPediatricProducts;
    }
    if (ageGroup?.includes("adult")) {
      return speechAdultProducts;
    }
    return [];
  };

  const getAccessoriesProductOptions = () => {
    const type = formData.accessories_type;
    switch (type) {
      case "Domes":
        return accessoriesDomesProducts;
      case "Receivers / Wires":
        return accessoriesReceiversProducts;
      case "Tubing & Hooks":
        return accessoriesTubingProducts;
      case "Filters & Guards":
        return accessoriesFiltersProducts;
      case "Cleaning & Care":
        return accessoriesCleaningProducts;
      case "Batteries":
        return accessoriesBatteriesProducts;
      case "Rechargeable Systems":
        return accessoriesRechargeableProducts;
      default:
        return [];
    }
  };

  const diagnosticProductOptions = getDiagnosticProductOptions();
  const speechProductOptions = getSpeechProductOptions();
  const accessoriesProductOptions = getAccessoriesProductOptions();

  // Prefill when editing
  useEffect(() => {
    if (isOpen && isEdit && initialData) {
      setHasPrefilled(false); // reset tracking when opened
      setFormData({
        category: initialData.category || "",
        age_group: initialData.age_group || "",
        brand: initialData.brand || "",
        model_type: initialData.model_type || "",
        product_name: initialData.product_name || "",
        description: initialData.description || "",
        location: initialData.location || "",
        unit_price: initialData.unit_price || "",
        gst_value: initialData.gst_value || "",
        use_in_trial: initialData.use_in_trial || false,
        stock_type: initialData.stock_type === "Serialized",
        serial_numbers: "",
        quantity_in_stock: initialData.quantity_in_stock || "",
        reorder_level: initialData.reorder_level || "",
      });

      // Ensure dropdowns are populated for the current category/brand
      if (initialData.category) {
        onCategoryChange?.(initialData.category);
      }

      if (initialData.category && initialData.brand) {
        onBrandChange?.(initialData.category, initialData.brand);
      }
      setShowAddBrand(false);
      setShowAddModel(false);

      // Delay setting hasPrefilled to true to allow the form to settle
      setTimeout(() => setHasPrefilled(true), 500);
    }
  }, [isOpen, isEdit, initialData]); // removed dependencies that cause loops

  const [errors, setErrors] = useState({});

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasPrefilled(false);
      setFormData({
        category: "",
        age_group: "",
        brand: "",
        model_type: "",
        product_name: "",
        description: "",
        location: "",
        unit_price: "",
        gst_value: "",
        use_in_trial: false,
        stock_type: false,
        serial_numbers: "",
        quantity_in_stock: "",
        reorder_level: "",
      });
      setErrors({});
      setShowAddBrand(false);
      setNewBrandName("");
      setShowAddModel(false);
      setNewModelName("");
    }
  }, [isOpen]);

  // Handle category change (wipe brand/model ONLY if it's a manual user interaction, not prefill)
  useEffect(() => {
    if (!formData.category) return;

    // If we've finished prefilling, or it's not an edit form, then clear dependents on category change
    if (hasPrefilled || !isEdit) {
      setFormData((prev) => ({
        ...prev,
        brand: "",
        model_type: "",
        accessories_type: "",
        age_group: "",
      }));
    }

    setShowAddBrand(false);
    setShowAddModel(false);

    if (formData.category !== "Hearing Aids Accessories") {
      onCategoryChange?.(formData.category);
    }
  }, [formData.category]);

  useEffect(() => {
    if (formData.category === "Hearing Aids Accessories" && formData.accessories_type) {
      if (hasPrefilled || !isEdit) {
        onCategoryChange?.(formData.category, formData.accessories_type);
      }
    }
  }, [formData.accessories_type]);

  // Fetch models when brand changes
  useEffect(() => {
    if (formData.brand && formData.category) {
      onBrandChange?.(formData.category, formData.brand, formData.model_type);
      if (hasPrefilled || !isEdit) {
        setFormData((prev) => {
          if (formData.category?.toLowerCase().includes("cochlear")) {
            return prev;
          }
          return { ...prev, model_type: "" };
        });
      }
      setShowAddModel(false);
    }
  }, [formData.brand, formData.category]);

  // Fetch dropdown options when implant_system (stored in model_type for Cochlear) is selected
  useEffect(() => {
    if (formData.category?.toLowerCase().includes("cochlear") && formData.model_type) {
      if (hasPrefilled || !isEdit) {
        // We use onBrandChange to ensure brand and category are also taken into account
        // when fetching dependent dropdowns for Cochlear devices.
        if (formData.brand) {
          onBrandChange?.(formData.category, formData.brand, formData.model_type);
        } else {
          onCategoryChange?.(formData.category, undefined, formData.model_type);
        }
      }
    }
  }, [formData.model_type, formData.category, formData.brand]);

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

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      setErrors((prev) => ({
        ...prev,
        newBrandName: "Brand name is required",
      }));
      return;
    }
    setCreatingBrand(true);
    const result = await onCreateBrand?.(
      newBrandName.trim(),
      formData.category,
      formData.accessories_type,
    );
    setCreatingBrand(false);

    if (result) {
      setNewBrandName("");
      setShowAddBrand(false);
      if (result.id) {
        updateField("brand", result.id);
      }
    }
  };

  const handleAddModel = async () => {
    if (!newModelName.trim()) {
      setErrors((prev) => ({
        ...prev,
        newModelName: "Model name is required",
      }));
      return;
    }

    setCreatingModel(true);
    const result = await onCreateModel?.(
      newModelName.trim(),
      formData.category,
      formData.brand,
    );
    setCreatingModel(false);

    if (result) {
      setNewModelName("");
      setShowAddModel(false);
      // Auto-select the newly created model if it has an id
      if (result.id) {
        updateField("model_type", result.id);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const isCochlear = formData.category?.toLowerCase().includes("cochlear");
    if (!formData.category) newErrors.category = "Category is required";
    if (!isDiagnostic && !isSpeech && !formData.brand) newErrors.brand = "Brand is required";
    if (formData.category !== "Hearing Aids Accessories" && !isSpeech && !formData.model_type) {
      newErrors.model_type = formData.category?.toLowerCase().includes("cochlear")
        ? "Implant system is required"
        : "Model is required";
    }
    if (formData.category?.toLowerCase().includes("cochlear") && formData.model_type === "External Processor" && !formData.accessories_type) {
      newErrors.accessories_type = "Accessory is required";
    }
    if (isSpeech && !formData.age_group) {
      newErrors.age_group = "Age group is required";
    }
    if (!formData.product_name)
      newErrors.product_name = "Product name is required";
    if (!formData.unit_price) newErrors.unit_price = "Unit price is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Prepare payload with brand and model as IDs

    const payload = {
      category: formData.category,
      product_name: formData.product_name,
      ...(!isDiagnostic && !isSpeech ? { brand: parseInt(formData.brand) || formData.brand } : {}),
      ...(isSpeech ? { age_groups: formData.age_group } : {}),
      description: formData.description || "",
      stock_type: formData.stock_type ? "Serialized" : "Non-Serialized",
      location: formData.location,
      unit_price: formData.unit_price,
      gst_value: formData.gst_value ? Number(formData.gst_value) : 0,
      use_in_trial: formData.use_in_trial,
      reorder_level: formData.reorder_level || 10,
    };

    if (isCochlear) {
      if (formData.model_type) {
        payload.implant_systems = formData.model_type;
      }
      if (formData.accessories_type) {
        payload.cochlear_accessory = formData.accessories_type;
      }
    } else if (!isSpeech) {
      payload.accessories_type = formData.accessories_type || "";
      if (formData.category !== "Hearing Aids Accessories" && formData.model_type) {
        payload.model_type = parseInt(formData.model_type) || formData.model_type;
      }
    }

    if (!formData.stock_type) {
      payload.quantity_in_stock = formData.quantity_in_stock;
    }
    // Add serial numbers if stock type is serialized and we are creating (not editing)
    if (!isEdit && formData.stock_type && formData.serial_numbers) {
      payload.serial_numbers = formData.serial_numbers
        .split(",")
        .map((sn) => sn.trim())
        .filter((sn) => sn.length > 0);
    }
    if (!onSubmit || typeof onSubmit !== "function") {
      console.error(
        "AddProductModal: onSubmit is not a function or undefined",
        onSubmit,
      );
      return;
    }

    onSubmit(payload);
  };

  const categoryOptions = categories?.map((cat) => ({
    label: cat,
    value: cat,
  }));
  const brandOptions = brands.map((brand) => ({
    label: brand.name,
    value: brand.id,
  }));

  const modelOptions = models.map((model) => ({
    label: model.name,
    value: model.id,
  }));

  const ageGroupOptions = ageGroups?.map((group) => ({
    label: group.label || group.value || group,
    value: group.value || group,
  })) || [];

  return (
    <Modal
      isModalOpen={isOpen}
      onClose={onClose}
      header={
        isEdit
          ? `Edit Product - ${initialData?.product_name || ""}`
          : "Add New Product"
      }
      showButton={false}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-96 overflow-y-auto"
      >
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
          {formData.category === "Hearing Aids Accessories" && (
            <DropDown
              label="Accessories Type"
              name="accessories_type"
              options={accessoriesTypeOptions}
              value={formData.accessories_type}
              onChange={updateField}
              placeholder="Select accessories type"
              error={errors.accessories_type}
              important
            />
          )}

          {isSpeech && ageGroups?.length > 0 && (
            <div className="space-y-2">
              <DropDown
                label="Age Groups"
                name="age_group"
                options={ageGroupOptions}
                value={formData.age_group}
                onChange={updateField}
                placeholder="Select age group"
                error={errors.age_group}
                important
              />
            </div>
          )}

          {!isDiagnostic && !isSpeech && (
            <div className="space-y-2">
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
              {formData.category && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddBrand(!showAddBrand)}
                  className="w-full"
                >
                  {showAddBrand ? "Cancel Add Brand" : "Add New Brand"}
                </Button>
              )}
              {showAddBrand && formData.category && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter brand name"
                    value={newBrandName}
                    onChange={(e) => {
                      setNewBrandName(e.target.value);
                      if (errors.newBrandName)
                        setErrors((prev) => ({ ...prev, newBrandName: "" }));
                    }}
                    error={errors.newBrandName}
                  />
                  <Button
                    type="button"
                    onClick={handleAddBrand}
                    disabled={creatingBrand || loading}
                    size="sm"
                  >
                    {creatingBrand ? "Creating..." : "Add"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {formData.category?.toLowerCase().includes("cochlear") && (
            <>
              <div className="space-y-2">
                <DropDown
                  label="Implant System"
                  name="model_type"
                  options={[
                    { label: "Internal Implant", value: "Internal Implant" },
                    { label: "External Processor", value: "External Processor" },
                  ]}
                  value={formData.model_type}
                  onChange={updateField}
                  placeholder="Select implant system"
                  error={errors.model_type}
                  important
                />
              </div>
              {formData.model_type === "External Processor" && cochlearAccessories && cochlearAccessories.length > 0 && (
                <div className="space-y-2">
                  <DropDown
                    label="Accessory"
                    name="accessories_type"
                    options={cochlearAccessories}
                    value={formData.accessories_type}
                    onChange={updateField}
                    placeholder="Select accessory"
                    error={errors.accessories_type}
                    important
                  />
                </div>
              )}
            </>
          )}

          {formData.category !== "Hearing Aids Accessories" && !formData.category?.toLowerCase().includes("cochlear") && !isSpeech && (
            <div className="space-y-2">
              <DropDown
                label="Model"
                name="model_type"
                options={modelOptions}
                value={formData.model_type}
                onChange={updateField}
                placeholder="Select model"
                error={errors.model_type}
                isDisabled={!isDiagnostic && !formData.brand}
                important
              />

              {(!isDiagnostic ? formData.brand : formData.category) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModel(!showAddModel)}
                  className="w-full"
                >
                  {showAddModel ? "Cancel Add Model" : "Add New Model"}
                </Button>
              )}
              {showAddModel && (!isDiagnostic ? formData.brand : formData.category) && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter model name"
                    value={newModelName}
                    onChange={(e) => {
                      setNewModelName(e.target.value);
                      if (errors.newModelName)
                        setErrors((prev) => ({ ...prev, newModelName: "" }));
                    }}
                    error={errors.newModelName}
                  />
                  <Button
                    type="button"
                    onClick={handleAddModel}
                    disabled={creatingModel || loading}
                    size="sm"
                  >
                    {creatingModel ? "Creating..." : "Add"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {(isDiagnostic && diagnosticProductOptions.length > 0) ||
            (isSpeech && speechProductOptions.length > 0) ||
            (formData.category === "Hearing Aids Accessories" && accessoriesProductOptions.length > 0) ? (
            <DropDown
              label="Product Name"
              name="product_name"
              options={
                isDiagnostic
                  ? diagnosticProductOptions
                  : isSpeech
                    ? speechProductOptions
                    : accessoriesProductOptions
              }
              value={formData.product_name}
              onChange={updateField}
              placeholder="Select product name"
              error={errors.product_name}
              important
            />
          ) : (
            <Input
              label="Product Name"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              placeholder="Enter product name"
              error={errors.product_name}
              important
            />
          )}

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Enter location"
          />

          <div className="flex gap-4">
            <div className="flex-1">
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
            <div className="flex-1">
              <Input
                label="GST Value (Rs)"
                name="gst_value"
                type="number"
                step="0.01"
                value={formData.gst_value}
                onChange={handleChange}
                placeholder="Ex. 18"
              />
            </div>
          </div>
        </div>

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
            className={`h-4 w-4 rounded-sm border flex items-center justify-center transition-all ${formData.stock_type
              ? "bg-[#1ba9c6] border-[#1ba9c6]"
              : "border-gray-400"
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
          <p>Serialized Stock (Check if product has serial numbers)</p>
        </label>
        {formData.stock_type && !isEdit ? (
          <div>
            <label className="text-sm font-medium mb-1 block">
              Serial Numbers (comma-separated){" "}
              <span className="text-red-500">*</span>
            </label>
            <TextArea
              name="serial_numbers"
              value={formData.serial_numbers}
              onChange={handleChange}
              placeholder="Enter serial numbers separated by commas (e.g., SN001, SN002, SN003)"
              rows={3}
              className="w-full px-3 py-2 border rounded-md"
            />
            {errors.serial_numbers && (
              <p className="text-red-500 text-xs mt-1">
                {errors.serial_numbers}
              </p>
            )}
          </div>
        ) : (
          <Input
            label="Quantity in Stock"
            name="quantity_in_stock"
            type="number"
            value={formData.quantity_in_stock}
            onChange={handleChange}
            placeholder="Enter quantity"
          />
        )}

        {formData.stock_type && isEdit && (
          <div className="p-3 bg-slate-50 rounded-md">
            <p className="text-sm text-slate-600">
              Serial numbers are managed via the <strong>Add Stock</strong>{" "}
              modal. Use Add Stock to add serials for serialized products.
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <TextArea
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
              className={`h-4 w-4 rounded-sm border flex items-center justify-center transition-all ${formData.use_in_trial
                ? "bg-[#1ba9c6] border-[#1ba9c6]"
                : "border-gray-400"
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
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading || creatingBrand || creatingModel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || creatingBrand || creatingModel}
          >
            {loading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Update Product"
                : "Create Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
