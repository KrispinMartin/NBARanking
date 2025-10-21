import axios from "axios";

const API = axios.create({
  baseURL: "https://nba-ranking-api.onrender.com",
});

export default API;
