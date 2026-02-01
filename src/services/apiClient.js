import axios from 'axios';
import { auth } from './firebase';

const baseURL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";
const apiClient = axios.create({ baseURL });

apiClient.interceptors.request.use(async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Não foi possível obter o token de autenticação", error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.group("❌ API Error");
    console.log("URL:", err.config?.baseURL + err.config?.url);
    console.log("Method:", err.config?.method);
    console.log("Request data:", err.config?.data);
    console.log("Status:", err.response?.status);
    console.log("Response data:", err.response?.data);
    console.groupEnd();
    return Promise.reject(err);
  }
);

export default apiClient;