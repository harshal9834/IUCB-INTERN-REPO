import { axiosInstance } from "./axios.js";

export const analyticsApi = {
  getReport: async (params?: any) => {
    return axiosInstance.get("/analytics/report", { params });
  },
};
export default analyticsApi;
