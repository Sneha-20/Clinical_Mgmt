import { routes } from "@/lib/utils/constants/route";
import { apiClient } from "../api";


export const getAppointmentList = async (params = {}) => {
  try {
    const { page = 1, service, search } = params;
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    // if (limit) queryParams.append("limit", limit.toString());
    if (search) queryParams.append("search", search);
    if (service && service !== "All") queryParams.append("service_type", service);
    
    const url = `${routes.audiologist.appointmentList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    console.log("ttttttt",response)
    // const patientData = {
    //   status: response.status || 200,
    //   nextPage: response.nextPage,
    //   previousPage: response.previousPage,
    //   totalItems: response.totalItems,
    //   totalPages: response.totalPages,
    //   patients:   response?.data || [],
    // };
    
    return response;
  } catch (error) {
    throw error;
  }
};