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
    setRefreshKey(prev => prev + 1); // Refresh the service list
    setActiveTab("list"); // Switch to list tab
  };

  const handleServiceUpdated = () => {
    setRefreshKey(prev => prev + 1); // Refresh the service list
  };

  const handleViewDetails = (serviceId) => {
    setSelectedServiceId(serviceId);
    setActiveTab("details");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">TGA Services</h1>
            <p className="text-gray-600 mt-1">Manage TGA service requests and track their status</p>
          </div>
        </div>
        <Button 
          onClick={() => setShowRequestForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create Service Request
        </Button>
      </div>

      {/* Service Request Form Modal */}
      {showRequestForm && (
        <ServiceRequestForm
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleServiceCreated}
        />
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("list")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "list"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Service List
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Service Details
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "list" && (
          <ServiceList 
            key={refreshKey}
            onViewDetails={handleViewDetails}
            onServiceUpdated={handleServiceUpdated}
          />
        )}
        {activeTab === "details" && selectedServiceId && (
          <ServiceDetails 
            serviceId={selectedServiceId}
            onBack={() => setActiveTab("list")}
            onServiceUpdated={handleServiceUpdated}
          />
        )}
      </div>
    </div>
  );
}
