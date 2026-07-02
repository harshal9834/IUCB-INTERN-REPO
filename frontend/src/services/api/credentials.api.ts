import { axiosInstance } from "./axios.js";

export const credentialsApi = {
  issueCredential: async (payload: any) => {
    return axiosInstance.post("/credentials/issue", payload);
  },

  // Future Extended CRUD methods compatible with PRD
  getCredentials: async (params?: any) => {
    return axiosInstance.get("/credentials", { params });
  },

  revokeCredential: async (id: string, payload?: any) => {
    return axiosInstance.post(`/credentials/${id}/revoke`, payload);
  },
};
export default credentialsApi;
