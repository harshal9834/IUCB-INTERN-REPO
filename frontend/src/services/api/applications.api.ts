import { axiosInstance } from "./axios.js";

export const applicationsApi = {
  apply: async (payload: any) => {
    return axiosInstance.post("/advisory/apply", payload);
  },

  getApplications: async (params?: any) => {
    return axiosInstance.get("/advisory/applications", { params });
  },

  decideApplication: async (id: string, decisionPayload: { status: string; remarks?: string }) => {
    return axiosInstance.post(`/advisory/applications/${id}/decision`, decisionPayload);
  },
};
export default applicationsApi;
