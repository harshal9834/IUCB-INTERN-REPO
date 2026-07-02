import { axiosInstance } from "./axios.js";

export const auditApi = {
  getLogs: async (params?: any) => {
    return axiosInstance.get("/audit/logs", { params });
  },
};
export default auditApi;
