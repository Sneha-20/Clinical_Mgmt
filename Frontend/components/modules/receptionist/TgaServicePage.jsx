"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ServiceRequestForm from "./component/ServiceRequestForm";
import ServiceList from "./component/ServiceList";
import ServiceDetails from "./component/ServiceDetails";

export default function TgaServicePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("list");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleServiceCreated = () => {
    setShowRequestForm(false);
    setRefreshKey((prev) => prev + 1); // Refresh the service list
    setActiveTab("list"); // Switch to list tab
  };

  const handleServiceUpdated = () => {
    setRefreshKey((prev) => prev + 1); // Refresh the service list
  };

  const handleViewDetails = (serviceId) => {
    setSelectedServiceId(serviceId);
    router.push(`/dashboard/tga-service/${serviceId}`); // Navigate to details page
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TGA Services</h1>
            <p className="text-gray-600 mt-1">
              Manage TGA service requests and track their status
            </p>
          </div>
        </div>
      </div>

      <div>
        <ServiceList
          key={refreshKey}
          onViewDetails={handleViewDetails}
          onServiceUpdated={handleServiceUpdated}
        />
        {/* {activeTab === "details" && selectedServiceId && (
          <ServiceDetails
            serviceId={selectedServiceId}
            onBack={() => setActiveTab("list")}
            onServiceUpdated={handleServiceUpdated}
          />
        )} */}
      </div>
    </div>
  );
}
