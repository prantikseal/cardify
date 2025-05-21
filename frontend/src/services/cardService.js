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

// Placeholder for other card methods
const getUserCards = () => {
  const token = authService.getCurrentUserToken();
  // Example: return axios.get(`${API_URL}/cards`, { headers: { Authorization: `Bearer ${token}` } });
  console.warn('getUserCards not implemented yet');
  return Promise.resolve({ data: [] }); // Placeholder
};

const getCardBySlug = (slug) => {
  // Example: return axios.get(`${API_URL}/cards/public/${slug}`);
  console.warn('getCardBySlug not implemented yet');
  return Promise.resolve({ data: {} }); // Placeholder
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
  getCardBySlug,
  updateCard,
  deleteCard,
};

export default cardService;
