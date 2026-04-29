import axios from "axios";

// Applies a 401 interceptor to the global axios instance.
// This covers all the files that import axios directly (not via src/services/api.js).
export const setupAxiosInterceptors = () => {
  axios.defaults.withCredentials = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      // Session expired — clear auth and redirect to login
      if (status === 401 && window.location.pathname !== "/") {
        localStorage.removeItem("crm_user");
        window.location.href = "/";
      }

      return Promise.reject(error);
    }
  );
};
