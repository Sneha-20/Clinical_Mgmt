"use client";

import { useState, useEffect, useCallback } from "react";
import { getTgaServiceList } from "@/lib/services/dashboard";
import { showToast } from "@/components/ui/toast";
import Pagination from "@/components/ui/Pagination";

export default function ServiceList({ onViewDetails, onServiceUpdated }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchServices = useCallback(async (page = 1, search = "") => {
    setLoading(true);
    try {
      const response = await getTgaServiceList({ page, search });
      setServices(response.data || []);
      setPagination({
        currentPage: page,
        totalPages: response.totalPages || 1,
        totalItems: response.totalItems || 0,
      });
    } catch (error) {
      showToast({
        type: "error",
        message: "Failed to fetch service list",
      });
      console.error("Service list fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearch = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    fetchServices(1, search);
  };

  const handlePageChange = (page) => {
    fetchServices(page, searchTerm);
  };

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
        <div className="text-sm text-gray-600">
          Total: {pagination.totalItems} services
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Complaint
                </th>
                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th> */}
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
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No service requests found
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.service_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{service.service_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {service.patient_name}
                      </div>
                      <div className="text-sm text-gray-500">{service.phone_primary}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {service.service_type?.replace(/_/g, " ").toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.complaint}</div>
                      {/* <div className="text-sm text-gray-500">SN: {service.serial_number}</div> */}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(service.urgency_level)}`}>
                        {service.urgency_level?.toUpperCase()}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{service.status}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(service.action_taken_on).toLocaleDateString()}
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
      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.currentPage}
          totalPages={pagination.totalPages}
          onNext={() => handlePageChange(pagination.currentPage + 1)}
          onPrev={() => handlePageChange(pagination.currentPage - 1)}
        />
      )}
    </div>
  );
}
