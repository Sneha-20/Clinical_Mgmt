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
