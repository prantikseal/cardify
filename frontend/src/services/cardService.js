import axios from 'axios';
import authService from './authService'; // To get the token

// The proxy in package.json will take care of routing to http://localhost:5001
const API_URL = ''; // No prefix needed

const getTemplates = () => {
  return axios.get(`${API_URL}/templates`);
};

const createCard = (cardData) => {
  const token = authService.getCurrentUserToken();
  if (!token) {
    // Handle case where token is not available, though UI should prevent this
    return Promise.reject(new Error('No authentication token found.'));
  }
  return axios.post(`${API_URL}/cards`, cardData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getUserCards = () => {
  const token = authService.getCurrentUserToken();
  if (!token) {
    return Promise.reject(new Error('No authentication token found.'));
  }
  return axios.get(`${API_URL}/cards`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getVisitorAnalytics = (cardId) => {
  const token = authService.getCurrentUserToken();
  if (!token) return Promise.reject(new Error('No authentication token found.'));
  return axios.get(`${API_URL}/cards/${cardId}/analytics/visitors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getMessageAnalytics = (cardId) => {
  const token = authService.getCurrentUserToken();
  if (!token) return Promise.reject(new Error('No authentication token found.'));
  return axios.get(`${API_URL}/cards/${cardId}/analytics/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getAppointmentAnalytics = (cardId) => {
  const token = authService.getCurrentUserToken();
  if (!token) return Promise.reject(new Error('No authentication token found.'));
  return axios.get(`${API_URL}/cards/${cardId}/analytics/appointments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

const getLinkClickAnalytics = (cardId) => {
  const token = authService.getCurrentUserToken();
  if (!token) return Promise.reject(new Error('No authentication token found.'));
  return axios.get(`${API_URL}/cards/${cardId}/analytics/link_clicks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Commenting out the old generic getCardAnalytics placeholder
// const getCardAnalytics = (cardId, analyticType) => {
//   const token = authService.getCurrentUserToken();
//   if (!token) {
//     return Promise.reject(new Error('No authentication token found.'));
//   }
//   // Example: return axios.get(`${API_URL}/cards/${cardId}/analytics/${analyticType}`, { headers: { Authorization: `Bearer ${token}` } });
//   console.warn(`getCardAnalytics for ${analyticType} not implemented yet. Card ID: ${cardId}`);
//   // Return mock data structure
//   if (analyticType === 'visitors') return Promise.resolve({ data: { count: 0, daily: [] } });
//   if (analyticType === 'messages') return Promise.resolve({ data: { count: 0, list: [] } });
//   if (analyticType === 'appointments') return Promise.resolve({ data: { count: 0, list: [] } });
//   if (analyticType === 'link_clicks') return Promise.resolve({ data: { count: 0, links: {} } });
//   return Promise.resolve({ data: {} }); // Default placeholder
// };

const getPublicCardBySlug = (card_slug) => {
  return axios.get(`${API_URL}/cards/public/${card_slug}`);
};

// Renamed from getCardBySlug to getPublicCardBySlug for clarity and to match new function
// const getCardBySlug = (slug) => {
//   // Example: return axios.get(`${API_URL}/cards/public/${slug}`);
//   console.warn('getCardBySlug not implemented yet');
//   return Promise.resolve({ data: {} }); // Placeholder
// };

const bookAppointment = (card_slug, appointmentData) => {
  return axios.post(`${API_URL}/cards/${card_slug}/book-appointment`, appointmentData);
};

const updateCard = (cardId, cardData) => {
  const token = authService.getCurrentUserToken();
  // Example: return axios.put(`${API_URL}/cards/${cardId}`, cardData, { headers: { Authorization: `Bearer ${token}` } });
  console.warn('updateCard not implemented yet');
  return Promise.resolve({ data: {} }); // Placeholder
};

const deleteCard = (cardId) => {
  const token = authService.getCurrentUserToken();
  // Example: return axios.delete(`${API_URL}/cards/${cardId}`, { headers: { Authorization: `Bearer ${token}` } });
  console.warn('deleteCard not implemented yet');
  return Promise.resolve({ data: {} }); // Placeholder
};


const cardService = {
  getTemplates,
  createCard,
  getUserCards,
  // getCardBySlug, // Replaced by getPublicCardBySlug
  getPublicCardBySlug,
  bookAppointment,
  // getCardAnalytics, // Replaced by specific methods
  getVisitorAnalytics,
  getMessageAnalytics,
  getAppointmentAnalytics,
  getLinkClickAnalytics,
  updateCard,
  deleteCard,
};

export default cardService;
