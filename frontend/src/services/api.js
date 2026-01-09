import { listingService, bidService, userService } from './firestore';
import { auth } from '../firebase.config';

// Helper to get current user ID
const getCurrentUserId = () => {
    if (!auth.currentUser) throw new Error("User not authenticated");
    return auth.currentUser.uid;
};

// Auth API - Mostly handled by AuthContext now, but keeping stubs if needed or removing usage
export const authAPI = {
    // These are now handled by Firebase Auth directly in AuthContext
    register: async () => ({ data: { success: true } }),
    login: async () => ({ data: { success: true } }),
    getMe: async () => ({ data: auth.currentUser }), // Fallback (unused likely)
    googleLogin: async () => ({ data: { success: true } }),

    // Wishlist
    getWishlist: async () => {
        return userService.getWishlist(getCurrentUserId()).then(data => ({ data: { wishlist: data } }));
    },
    addToWishlist: async (listingId) => {
        return userService.addToWishlist(getCurrentUserId(), listingId).then(res => ({ data: res }));
    },
    removeFromWishlist: async (listingId) => {
        return userService.removeFromWishlist(getCurrentUserId(), listingId).then(res => ({ data: res }));
    }
};

// Listings API
export const listingsAPI = {
    getAll: (params) => listingService.getAll(params?.category).then(data => ({ data })),
    getOne: (id) => listingService.getOne(id).then(data => ({ data })), // Component expects { data: ... }
    create: (listingData) => listingService.create(listingData, getCurrentUserId()).then(res => ({ data: res })),
    update: (id, listingData) => listingService.update(id, listingData).then(res => ({ data: res })),
    delete: (id) => listingService.delete(id).then(res => ({ data: res })),
    getMyListings: () => listingService.getMyListings(getCurrentUserId()).then(data => ({ data })),
    checkConfig: !!import.meta.env.VITE_FIREBASE_API_KEY
};

// Bids API
export const bidsAPI = {
    getForListing: (listingId) => bidService.getForListing(listingId).then(data => ({ data })),
    getMyBids: () => bidService.getMyBids(getCurrentUserId()).then(data => ({ data })),
    create: (bidData) => bidService.create(bidData, getCurrentUserId()).then(res => ({ data: res })),
    updateStatus: (id, status) => bidService.updateStatus(id, status).then(res => ({ data: res }))
};

// Admin API


const api = {
    authAPI,
    listingsAPI,
    bidsAPI
};

export default api;
