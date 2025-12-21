import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getMe: () => api.get('/auth/me'),
    addToWishlist: (listingId) => api.post(`/auth/wishlist/${listingId}`),
    removeFromWishlist: (listingId) => api.delete(`/auth/wishlist/${listingId}`),
    googleLogin: (tokenId) => api.post('/auth/google', { tokenId }),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password })
};

// Listings API
export const listingsAPI = {
    getAll: (params) => api.get('/listings', { params }),
    getOne: (id) => api.get(`/listings/${id}`),
    create: (listingData) => api.post('/listings', listingData),
    update: (id, listingData) => api.put(`/listings/${id}`, listingData),
    delete: (id) => api.delete(`/listings/${id}`),
    getMyListings: () => api.get('/listings/my/listings')
};

// Bids API
export const bidsAPI = {
    getForListing: (listingId) => api.get(`/bids/listing/${listingId}`),
    getMyBids: () => api.get('/bids/my/bids'),
    create: (bidData) => api.post('/bids', bidData),
    updateStatus: (id, status) => api.put(`/bids/${id}`, { status })
};

export default api;
