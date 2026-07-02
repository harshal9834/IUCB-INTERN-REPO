import { axiosInstance } from "./axios.js";

export const settingsApi = {
  getSettings: async () => {
    return axiosInstance.get("/settings");
  },

  updateSettings: async (payload: any) => {
    return axiosInstance.put("/settings", payload);
  },
};
export default settingsApi;
