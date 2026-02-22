"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DropDown from "@/components/ui/dropdown";
import Modal from "@/components/ui/Modal";
import { 
  getPatientServiceList, 
  getServiceTypes, 
  getPatientDevicePurchases,
  createTgaServiceRequest 
} from "@/lib/services/dashboard";
import { showToast } from "@/components/ui/toast";
import { startLoading, stopLoading } from "@/lib/redux/slice/uiSlice";
import TextArea from '@/components/ui/TextArea'

export default function ServiceRequestForm({ onClose, onSuccess }) {
  const dispatch = useDispatch();
  const [patients, setPatients] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [devicePurchases, setDevicePurchases] = useState([]);
  
  const [formData, setFormData] = useState({
    patient_id: "",
    service_type: "",
    device_serial_need_service: "",
    complaint: "",
    // warranty_applicable: false,
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      dispatch(startLoading());
      try {
        const [patientsData, serviceTypesData] = await Promise.all([
          getPatientServiceList(),
          getServiceTypes(),
        ]);
        
        setPatients(patientsData || []);
        setServiceTypes(serviceTypesData || []);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
        showToast({
          type: "error",
          message: "Failed to load dropdown data",
        });
      } finally {
        dispatch(stopLoading());
      }
    };

    fetchDropdownData();
  }, [dispatch]);

  // Fetch device purchases when patient is selected
  useEffect(() => {
    if (formData.patient_id) {
      const fetchDevicePurchases = async () => {
        try {
          const devices = await getPatientDevicePurchases(formData.patient_id);
          setDevicePurchases(devices || []);
        } catch (error) {
          console.error("Failed to fetch device purchases:", error);
          setDevicePurchases([]);
        }
      };

      fetchDevicePurchases();
    } else {
      setDevicePurchases([]);
    }
  }, [formData.patient_id]);

  const updateField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(startLoading());

    try {
      await createTgaServiceRequest(formData);
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
      dispatch(stopLoading());
    }
  };

  // Format dropdown options
  const patientOptions = patients.map((patient) => ({
    label: `${patient.patient_name} - (${patient.phone || patient.phone_primary})`,
    value: patient.id || patient.patient_id,
  }));

  const serviceTypeOptions = serviceTypes.map((type) => ({
    label: type.label || type,
    value: type.value || type,
  }));

  const deviceOptions = devicePurchases.map((device) => ({
    label: `${device.product_name} - SN: ${device.serial_number}`,
    value: device.serial_number,
  }));

  return (
    <Modal header="Create Service Request" isModalOpen={true} onClose={onClose} showButton={false}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DropDown
            label="Patient"
            options={patientOptions}
            value={formData.patient_id}
            onChange={(name, value) => updateField("patient_id", value)}
            required
          />
          
          <DropDown
            label="Service Type"
            options={serviceTypeOptions}
            value={formData.service_type}
            onChange={(name, value) => updateField("service_type", value)}
            required
          />
          
          <DropDown
            label="Device Serial Number"
            options={deviceOptions}
            value={formData.device_serial_need_service}
            onChange={(name, value) => updateField("device_serial_need_service", value)}
            disabled={!formData.patient_id}
            placeholder={formData.patient_id ? "Select device" : "Select patient first"}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complaint
          </label>
          <TextArea
            className="w-full border border-gray-300 rounded-md p-2"
            rows={4}
            value={formData.complaint}
            onChange={(e) => updateField("complaint", e.target.value)}
            placeholder="Describe the issue or complaint..."
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit">
            Create Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
