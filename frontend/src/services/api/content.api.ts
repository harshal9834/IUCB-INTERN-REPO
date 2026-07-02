import { axiosInstance } from "./axios.js";

export const contentApi = {
  getArticles: async (params?: any) => {
    return axiosInstance.get("/content/articles", { params });
  },

  createArticle: async (payload: any) => {
    return axiosInstance.post("/content/articles", payload);
  },

  getResources: async (params?: any) => {
    return axiosInstance.get("/content/resources", { params });
  },

  createResource: async (payload: any) => {
    return axiosInstance.post("/content/resources", payload);
  },
};
export default contentApi;
