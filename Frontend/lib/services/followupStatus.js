export const getTodayPatientList = async (params = {}) => {
  try {
    const { page , service, search, status } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append("page", page.toString());
    if (search) queryParams.append("search", search);
    if (status && status !== "All") queryParams.append("status", status);
    if (service && service !== "All") queryParams.append("service_type", service);
    
    const url = `${routes.todayPatientList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    const patientData = {
      status: response.status || 200,
      nextPage: response.nextPage,
      previousPage: response.previousPage,
      totalItems: response.totalItems,
      totalPages: response.totalPages,
      patients:  response?.data || [],
    };
    
    return patientData;
  } catch (error) {
    throw error;
  }
};