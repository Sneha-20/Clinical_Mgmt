import { apiClient } from "../api";
import { routes } from "../utils/constants/route";

export const getAppointmentRequests = async (params = {}) => {
  try {
    const { page = 1 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    
    const url = `${routes.appointmentRequestList}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

export const markRequestAsContacted = async (requestId, payload) => {
  try {
    const url = `${routes.appointmentRequestBase}${requestId}/update/`;
    const response = await apiClient.patch(url, payload);
    return response;
  } catch (error) {
    throw error;
  }
};
