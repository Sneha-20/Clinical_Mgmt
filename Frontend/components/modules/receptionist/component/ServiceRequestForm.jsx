"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DropDown from "@/components/ui/dropdown";
import Modal from "@/components/ui/Modal";
import { createTgaService } from "@/lib/services/dashboard";
import { showToast } from "@/components/ui/toast";
import { tgaServiceTypeOptions } from "@/lib/utils/constants/staticValue";

export default function ServiceRequestForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: "",
    patient_phone: "",
    patient_email: "",
    service_type: "",
    machine_model: "",
    serial_number: "",
    issue_description: "",
    urgency_level: "normal",
    preferred_date: "",
    notes: "",
  });

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createTgaService(formData);
      showToast({
        type: "success",
        message: "Service request created successfully!",
      });
      onSuccess();
    } catch (error) {
      showToast({
        type: "error",
        message: error?.message || "Failed to create service request",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal header="Create Service Request" isModalOpen={true} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Patient Name"
            value={formData.patient_name}
            onChange={(e) => updateField("patient_name", e.target.value)}
            required
          />
          
          <Input
            label="Patient Phone"
            value={formData.patient_phone}
            onChange={(e) => updateField("patient_phone", e.target.value)}
            required
          />
          
          <Input
            label="Patient Email"
            type="email"
            value={formData.patient_email}
            onChange={(e) => updateField("patient_email", e.target.value)}
          />
          
          <DropDown
            label="Service Type"
            options={tgaServiceTypeOptions}
            value={formData.service_type}
            onChange={(name, value) => updateField("service_type", value)}
            required
          />
          
          <Input
            label="Machine Model"
            value={formData.machine_model}
            onChange={(e) => updateField("machine_model", e.target.value)}
            required
          />
          
          <Input
            label="Serial Number"
            value={formData.serial_number}
            onChange={(e) => updateField("serial_number", e.target.value)}
          />
          
          <DropDown
            label="Urgency Level"
            options={[
              { label: "Normal", value: "normal" },
              { label: "High", value: "high" },
              { label: "Urgent", value: "urgent" },
            ]}
            value={formData.urgency_level}
            onChange={(name, value) => updateField("urgency_level", value)}
          />
          
          <Input
            label="Preferred Date"
            type="date"
            value={formData.preferred_date}
            onChange={(e) => updateField("preferred_date", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Issue Description
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            value={formData.issue_description}
            onChange={(e) => updateField("issue_description", e.target.value)}
            placeholder="Describe the issue or service required..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-md p-2"
            rows={3}
            value={formData.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Any additional information..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
