import { routes } from "@/lib/utils/constants/route";
import { apiClient } from "../api";

export const getAppointmentList = async (params = {}) => {
  try {
    const { page = 1 } = params;

    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    const url = `${
      routes.audiologist.appointmentList
    }?${queryParams.toString()}`;
    const response = await apiClient.get(url);

    return response;
  } catch (error) {
    throw error;
  }
};

export const getCompleteTest = async (params = {}) => {
  try {
    const { page = 1 } = params;

    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    // if (search) queryParams.append("search", search);
    // if (service && service !== "All") queryParams.append("service_type", service);

    const url = `${
      routes.audiologist.completedTestList
    }?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getActiveTrialDeviceList = async (params = {}) => {
  try {
    const { page = 1 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    const url = `${
      routes.audiologist.activeTrialDevice
    }?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchInventoryDevice = async () => {
  try {
    const url = `${routes.audiologist.inventoryDeviceList}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

export const fetchSerialList = async (params = {}) => {
  const { deviceId } = params;
  try {
    const url = `${routes.audiologist.deviceSerialList}/${deviceId}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

export const bookedDeviceForm = async (visitId,bookedDevicedata) => {
   try{
     const response = await apiClient.post(`${routes.audiologist.bookeddevice}${visitId}/complete/`, bookedDevicedata);
     const bookDeviceResponse = response?.data?.data || response?.data || response;
     return bookDeviceResponse
   }catch(err){
    throw err?.response?.data || "registration failed"
   }
}

export const returnTrialDevice = async (serialNumber,notes) => {
   try{
     const response = await apiClient.post(`${routes.audiologist.returnDevice}`, {serial_number:serialNumber,device_condition_on_return:notes});
     const returnDeviceResponse = response?.data?.data || response?.data || response;
     console.log("returnDeviceResponse",returnDeviceResponse)
     return returnDeviceResponse
   }catch(err){
    throw err?.response?.data || "failed to return device"
   }
}

/**
 * Get awaiting stock trials list
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @returns {Promise<Object>} Response with awaiting stock trials list
 */
export const getAwaitingStockTrials = async (params = {}) => {
  try {
    const { page = 1 } = params;
    const queryParams = new URLSearchParams();
    queryParams.append("page", page.toString());
    const url = `${routes.audiologist.awaitingStockTrials}?${queryParams.toString()}`;
    const response = await apiClient.get(url);
    return response;
  } catch (error) {
    throw error;
  }
};

/**
 * Complete awaiting stock trial
 * @param {number} trialId - Trial ID to complete
 * @param {Object} data - Completion data
 * @returns {Promise<Object>} Response with completion status
 */
export const completeAwaitingStockTrial = async (trialId, data) => {
  try {
    const response = await apiClient.post(
      `${routes.audiologist.completeAwaitingTrial}${trialId}/complete/`,
      data
    );
    return response?.data?.data || response?.data || response;
  } catch (err) {
    throw err?.response?.data || "Failed to complete trial";
  }
}

/**
 * Allocate a serial number for an awaiting stock trial
 * @param {number} trialId - ID of the trial
 * @param {Object} data - Payload containing booked_device_serial
 * @returns {Promise<Object>} Response object
 */
export const allocateTrialSerial = async (trialId, data) => {
  try {
    const response = await apiClient.patch(
      `${routes.audiologist.allocateSerialTrial}${trialId}/`,
      data
    );
    return response?.data?.data || response?.data || response;
  } catch (err) {
    throw err?.response?.data || "Failed to allocate serial";
  }
};
