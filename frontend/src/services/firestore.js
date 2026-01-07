import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.config';

// Collection Refs
const listingsRef = collection(db, 'listings');
const bidsRef = collection(db, 'bids');
const usersRef = collection(db, 'users');

// Listings Service
export const listingService = {
    // Create Listing
    create: async (listingData, userId) => {
        try {
            const docRef = await addDoc(listingsRef, {
                ...listingData,
                owner: userId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                status: 'active'
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error creating listing:", error);
            throw error;
        }
    },

    // Get All Listings (with optional category filter)
    getAll: async (category = null) => {
        try {
            let q = query(listingsRef, orderBy('createdAt', 'desc'));
            if (category && category !== 'All') {
                q = query(listingsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
            }
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting listings:", error);
            throw error;
        }
    },

    // Get Single Listing
    getOne: async (id) => {
        try {
            const docRef = doc(db, 'listings', id);
            const snapshot = await getDoc(docRef);
            if (snapshot.exists()) {
                // Also fetch owner details
                const data = snapshot.data();
                const ownerRef = doc(db, 'users', data.owner);
                const ownerSnap = await getDoc(ownerRef);
                const ownerData = ownerSnap.exists() ? ownerSnap.data() : { username: 'Unknown User' };

                return { id: snapshot.id, ...data, owner: { _id: data.owner, ...ownerData } };
            }
            return null;
        } catch (error) {
            console.error("Error getting listing:", error);
            throw error;
        }
    },

    // Update Listing
    update: async (id, updateData) => {
        try {
            const docRef = doc(db, 'listings', id);
            await updateDoc(docRef, { ...updateData, updatedAt: serverTimestamp() });
            return { success: true };
        } catch (error) {
            console.error("Error updating listing:", error);
            throw error;
        }
    },

    // Delete Listing
    delete: async (id) => {
        try {
            await deleteDoc(doc(db, 'listings', id));
            return { success: true };
        } catch (error) {
            console.error("Error deleting listing:", error);
            throw error;
        }
    },

    // Get User's Listings
    getMyListings: async (userId) => {
        try {
            const q = query(listingsRef, where('owner', '==', userId), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting my listings:", error);
            throw error;
        }
    }
};

// Bids Service
export const bidService = {
    // Create Bid
    create: async (bidData, userId) => {
        try {
            const docRef = await addDoc(bidsRef, {
                ...bidData,
                bidder: userId,
                status: 'pending',
                createdAt: serverTimestamp()
            });
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error placing bid:", error);
            throw error;
        }
    },

    // Get Bids for a Listing
    getForListing: async (listingId) => {
        try {
            const q = query(bidsRef, where('listing', '==', listingId), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            // Enrich with bidder info
            const bids = await Promise.all(snapshot.docs.map(async (bidDoc) => {
                const data = bidDoc.data();
                const bidderRef = doc(db, 'users', data.bidder);
                const bidderSnap = await getDoc(bidderRef);
                const bidderData = bidderSnap.exists() ? bidderSnap.data() : { username: 'Unknown' };

                return {
                    id: bidDoc.id,
                    ...data,
                    bidder: { _id: data.bidder, ...bidderData }
                };
            }));

            return bids;
        } catch (error) {
            console.error("Error getting bids:", error);
            throw error;
        }
    },

    // Get My Bids
    getMyBids: async (userId) => {
        try {
            const q = query(bidsRef, where('bidder', '==', userId), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            // Enrich with listing info
            const bids = await Promise.all(snapshot.docs.map(async (bidDoc) => {
                const data = bidDoc.data();
                const listingRef = doc(db, 'listings', data.listing);
                const listingSnap = await getDoc(listingRef);
                const listingData = listingSnap.exists() ? listingSnap.data() : { title: 'Unknown Listing' };

                return {
                    id: bidDoc.id,
                    ...data,
                    listing: { _id: data.listing, ...listingData }
                };
            }));

            return bids;
        } catch (error) {
            console.error("Error getting my bids:", error);
            throw error;
        }
    },

    // Update Bid Status
    updateStatus: async (bidId, status) => {
        try {
            const docRef = doc(db, 'bids', bidId);
            await updateDoc(docRef, { status });
            return { success: true };
        } catch (error) {
            console.error("Error updating bid status:", error);
            throw error;
        }
    }
};

// User Service
export const userService = {
    addToWishlist: async (userId, listingId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const wishlist = userData.wishlist || [];
                if (!wishlist.includes(listingId)) {
                    await updateDoc(userRef, {
                        wishlist: [...wishlist, listingId]
                    });
                }
            }
            return { success: true };
        } catch (error) {
            console.error("Error adding to wishlist:", error);
            throw error;
        }
    },

    removeFromWishlist: async (userId, listingId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const wishlist = userData.wishlist || [];
                const newWishlist = wishlist.filter(id => id !== listingId);
                await updateDoc(userRef, {
                    wishlist: newWishlist
                });
            }
            return { success: true };
        } catch (error) {
            console.error("Error removing from wishlist:", error);
            throw error;
        }
    },

    getWishlist: async (userId) => {
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const userData = userSnap.data();
                const wishlistIds = userData.wishlist || [];

                if (wishlistIds.length === 0) return [];

                // Fetch all listings
                const listings = await Promise.all(wishlistIds.map(async (id) => {
                    const listingSnap = await getDoc(doc(db, 'listings', id));
                    if (listingSnap.exists()) {
                        const data = listingSnap.data();
                        // We might need owner info too
                        return {
                            _id: listingSnap.id,
                            id: listingSnap.id,
                            ...data
                        };
                    }
                    return null;
                }));

                return listings.filter(l => l !== null);
            }
            return [];
        } catch (error) {
            console.error("Error getting wishlist:", error);
            throw error;
        }
    }
};
