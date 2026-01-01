import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8084",
  withCredentials: true,
});

// Session-based: cookies only, no Authorization header

export default api;
