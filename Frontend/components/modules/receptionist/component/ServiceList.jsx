"use client";

import { useState, useEffect, useCallback } from "react";
import { getTgaServiceList } from "@/lib/services/dashboard";
import { showToast } from "@/components/ui/toast";
import Pagination from "@/components/ui/Pagination";

export default function ServiceList({ onViewDetails, onServiceUpdated }) {
  const [pendingServices, setPendingServices] = useState([]);
  const [completedServices, setCompletedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const [pendingPagination, setPendingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const [completedPagination, setCompletedPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchServices = useCallback(async (status, page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await getTgaServiceList({ page, search, status });
      const services = response.data || [];

      if (status === "Pending") {
        setPendingServices(services);
        setPendingPagination({
          currentPage: page,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
        });
      } else {
        setCompletedServices(services);
        setCompletedPagination({
          currentPage: page,
          totalPages: response.totalPages || 1,
          totalItems: response.totalItems || 0,
        });
      }
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to fetch ${status.toLowerCase()} service list`,
      });
      console.error(`${status} service list fetch error:`, error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices("Pending", 1, searchTerm);
    fetchServices("Completed", 1, searchTerm);
  }, [fetchServices, searchTerm]);

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
  };

  const handlePageChange = (page, status) => {
    fetchServices(status, page, searchTerm);
  };

  const currentServices = activeTab === "pending" ? pendingServices : completedServices;
  const currentPagination = activeTab === "pending" ? pendingPagination : completedPagination;
  const currentStatus = activeTab === "pending" ? "Pending" : "Completed";

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by patient name, phone, or service type..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Pending Services ({pendingPagination.totalItems})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "completed"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Completed Services ({completedPagination.totalItems})
          </button>
        </nav>
      </div>

      {/* Services Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th> */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Taken
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : currentServices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No {currentStatus.toLowerCase()} services found
                  </td>
                </tr>
              ) : (
                currentServices.map((service) => (
                  <tr key={service.service_id} className="hover:bg-gray-50">
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{service.service_id}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.patient_name}
                      </div>
                      <div className="text-sm text-gray-500">{service.phone_primary}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.service_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.complaint}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        service.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.action_taken ? (
                        <div className="max-w-xs truncate" title={service.action_taken}>
                          {service.action_taken}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(service.service_id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {currentPagination.totalPages > 1 && (
        <Pagination
          page={currentPagination.currentPage}
          totalPages={currentPagination.totalPages}
          onNext={() => handlePageChange(currentPagination.currentPage + 1, currentStatus)}
          onPrev={() => handlePageChange(currentPagination.currentPage - 1, currentStatus)}
        />
      )}
    </div>
  );
}
