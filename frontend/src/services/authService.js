import axios from 'axios';

// The proxy in package.json will take care of routing to http://localhost:5001
const API_URL = ''; // No prefix needed if backend routes are /register, /login

const register = (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  if (response.data.token) {
    localStorage.setItem('userToken', response.data.token);
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem('userToken');
};

const getCurrentUserToken = () => {
  return localStorage.getItem('userToken');
};

// Optional: Decode token to get user info (requires a JWT decoding library like jwt-decode)
// const getCurrentUserInfo = () => {
//   const token = getCurrentUserToken();
//   if (token) {
//     // import jwt_decode from "jwt-decode";
//     // return jwt_decode(token);
//     return { token }; // Placeholder
//   }
//   return null;
// };

const authService = {
  register,
  login,
  logout,
  getCurrentUserToken,
  // getCurrentUserInfo,
};

export default authService;
