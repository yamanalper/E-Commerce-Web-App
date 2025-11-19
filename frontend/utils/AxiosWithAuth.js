import axios from "axios";
import environment from "./environment";

export const AxiosWithAuth = () => {
  const token = localStorage.getItem("token");
  return axios.create({
    baseURL: environment.API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

export const renewAPI = (token) => {
  token && localStorage.setItem("token", token);

  AxiosWithAuth();
};

renewAPI(localStorage.getItem("token"));