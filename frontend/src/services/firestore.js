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
    serverTimestamp,
    onSnapshot,
    documentId
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { setDoc } from 'firebase/firestore';

// Collection Refs
const listingsRef = collection(db, 'listings');
const deletedListingsRef = collection(db, 'deletedListings');
const bidsRef = collection(db, 'bids');
const usersRef = collection(db, 'users');

// In-memory cache for user profiles to optimize inbox loading
const userProfileCache = {};

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

    // Get All Listings (with optional category filter and search)
    getAll: async (category = null, search = null) => {
        try {
            let q = query(listingsRef, orderBy('createdAt', 'desc'));
            if (category && category !== 'All') {
                q = query(listingsRef, where('category', '==', category), orderBy('createdAt', 'desc'));
            }
            const snapshot = await getDocs(q);

            // Enrich with owner info
            let listings = await Promise.all(snapshot.docs.map(async (listingDoc) => {
                const data = listingDoc.data();
                let ownerData = { username: 'Unknown User' };
                if (data.owner) {
                    const ownerRef = doc(db, 'users', data.owner);
                    const ownerSnap = await getDoc(ownerRef);
                    if (ownerSnap.exists()) {
                        ownerData = ownerSnap.data();
                    }
                }
                return {
                    id: listingDoc.id,
                    ...data,
                    owner: { _id: data.owner, ...ownerData }
                };
            }));

            // Apply client-side search filter if search query exists
            if (search && search.trim() !== '') {
                const searchLower = search.toLowerCase().trim();
                listings = listings.filter(listing => {
                    const titleMatch = listing.title?.toLowerCase().includes(searchLower);
                    const descriptionMatch = listing.description?.toLowerCase().includes(searchLower);
                    const categoryMatch = listing.category?.toLowerCase().includes(searchLower);
                    return titleMatch || descriptionMatch || categoryMatch;
                });
            }

            return listings;
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

    // Delete Listing (Move to deletedListings collection)
    delete: async (id, reason = null, adminId = null) => {
        try {
            const docRef = doc(db, 'listings', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();

                // If admin is deleting with a reason, send message to the listing owner
                if (reason && adminId && data.owner) {
                    try {
                        // Create or get conversation between admin and listing owner
                        const participants = [adminId, data.owner].sort();
                        const conversationId = participants.join('_');
                        const conversationRef = doc(db, 'conversations', conversationId);
                        const conversationSnap = await getDoc(conversationRef);

                        if (!conversationSnap.exists()) {
                            await setDoc(conversationRef, {
                                participants: participants,
                                createdAt: serverTimestamp(),
                                updatedAt: serverTimestamp(),
                                lastMessage: ''
                            });
                        }

                        // Send automated message
                        const messageText = `Your listing "${data.title}" has been removed by the admin.\n\nReason: ${reason}`;
                        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
                        await addDoc(messagesRef, {
                            senderId: adminId,
                            text: messageText,
                            createdAt: serverTimestamp()
                        });

                        // Update conversation last message
                        await updateDoc(conversationRef, {
                            lastMessage: messageText,
                            updatedAt: serverTimestamp()
                        });
                    } catch (msgError) {
                        console.error("Error sending deletion notification message:", msgError);
                        // Continue with deletion even if message fails
                    }
                }

                // Save to deletedListings collection
                await setDoc(doc(db, 'deletedListings', id), {
                    ...data,
                    originalId: id,
                    deletedAt: serverTimestamp(),
                    deletionReason: reason || 'No reason provided',
                    deletedBy: adminId || 'unknown',
                    status: 'deleted'
                });

                // Remove from active listings
                await deleteDoc(docRef);
                return { success: true };
            }
            throw new Error("Listing not found");
        } catch (error) {
            console.error("Error deleting listing:", error);
            throw error;
        }
    },

    // Get User's Listings
    getMyListings: async (userId) => {
        try {
            const q = query(listingsRef, where('owner', '==', userId));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting my listings:", error);
            throw error;
        }
    },
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

    // Get All Bids (Admin)
    getAll: async () => {
        try {
            const q = query(bidsRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const bids = await Promise.all(snapshot.docs.map(async (bidDoc) => {
                const data = bidDoc.data();
                const listingRef = doc(db, 'listings', data.listing);
                const listingSnap = await getDoc(listingRef);
                const listingData = listingSnap.exists() ? listingSnap.data() : { title: 'Unknown Listing' };

                const bidderRef = doc(db, 'users', data.bidder);
                const bidderSnap = await getDoc(bidderRef);
                const bidderData = bidderSnap.exists() ? bidderSnap.data() : { username: 'Unknown' };

                return {
                    id: bidDoc.id,
                    ...data,
                    listing: { _id: data.listing, ...listingData },
                    bidder: { _id: data.bidder, ...bidderData }
                };
            }));

            return bids;
        } catch (error) {
            console.error("Error getting all bids:", error);
            throw error;
        }
    },

    // Get Bids for a Listing
    getForListing: async (listingId) => {
        try {
            const q = query(bidsRef, where('listing', '==', listingId));
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
            const q = query(bidsRef, where('bidder', '==', userId));
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
                const listingPromises = wishlistIds.map(async (id) => {
                    if (!id || typeof id !== 'string') return null;
                    try {
                        const listingSnap = await getDoc(doc(db, 'listings', id));
                        if (listingSnap.exists()) {
                            const data = listingSnap.data();
                            return {
                                _id: listingSnap.id,
                                id: listingSnap.id,
                                ...data
                            };
                        }
                    } catch (err) {
                        console.warn(`Failed to fetch listing ${id}:`, err);
                    }
                    return null;
                });

                const listings = await Promise.all(listingPromises);

                return listings.filter(l => l !== null);
            }
            return [];
        } catch (error) {
            console.error("Error getting wishlist:", error);
            throw error;
        }
    },

    getAll: async () => {
        try {
            const q = query(usersRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting all users:", error);
            throw error;
        }
    },

    updateStatus: async (userId, status) => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, { status: status });
            return { success: true };
        } catch (error) {
            console.error("Error updating user status:", error);
            throw error;
        }
    },

    getPublicProfile: async (userId) => {
        try {
            // Fetch user data
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                throw new Error("User not found");
            }

            const userData = userSnap.data();

            // Fetch user's active listings
            const q = query(listingsRef, where('owner', '==', userId), orderBy('createdAt', 'desc'));
            const listingsSnap = await getDocs(q);
            const listings = listingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Return public profile data (exclude sensitive info)
            return {
                id: userId,
                username: userData.username,
                photoURL: userData.photoURL || null,
                location: userData.location || null,
                createdAt: userData.createdAt,
                listingsCount: listings.length,
                listings: listings
            };
        } catch (error) {
            console.error("Error getting public profile:", error);
            throw error;
        }
    }
};

// Chat Service
export const chatService = {
    // Create or Get Conversation
    createConversation: async (participants) => {
        try {
            // Check if conversation already exists (simplified check)
            // In a real app, you'd likely query for a conversation containing these exact participants
            // For now, we'll just create a new one every time or rely on a composite ID if needed
            // Let's use a composite ID of sorted user IDs to ensure uniqueness if possible,
            // or just query. For speed, we will just create/return if exists query.

            const conversationsRef = collection(db, 'conversations');
            // Basic query to find if a chat exists between these two
            // Note: Array-contains is limited. A better schema usually involves a map of participants.
            // For this MVP, we just create a new one if we don't find one in a simple client-side check or just create.
            // We'll proceed with creating/getting based on a unique ID we generate:

            const sortedIds = [...participants].sort().join('_');
            const docRef = doc(db, 'conversations', sortedIds);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    participants: participants,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    lastMessage: ''
                });
            }
            return { id: docRef.id };
        } catch (error) {
            console.error("Error creating conversation:", error);
            throw error;
        }
    },

    // Send Message
    sendMessage: async (conversationId, senderId, text) => {
        try {
            const messagesRef = collection(db, 'conversations', conversationId, 'messages');
            await addDoc(messagesRef, {
                senderId: senderId,
                text: text,
                createdAt: serverTimestamp()
            });

            // Update conversation last message
            const conversationRef = doc(db, 'conversations', conversationId);
            await updateDoc(conversationRef, {
                lastMessage: text,
                updatedAt: serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error("Error sending message:", error);
            throw error;
        }
    },

    // Subscribe to Messages
    subscribeToMessages: (conversationId, callback) => {
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        // Return the unsubscribe function directly
        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            callback(messages);
        });
    },

    // Get All Conversations for User (One-time fetch)
    getConversations: async (userId) => {
        try {
            const conversationsRef = collection(db, 'conversations');
            const q = query(conversationsRef, where('participants', 'array-contains', userId), orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);

            const conversations = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                // Find the other participant
                const otherUserId = data.participants.find(p => p !== userId);
                let otherUser = { username: 'Unknown User', _id: otherUserId };

                if (otherUserId) {
                    const userRef = doc(db, 'users', otherUserId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        otherUser = { _id: otherUserId, ...userSnap.data() };
                    }
                }

                return {
                    id: docSnap.id,
                    ...data,
                    otherUser
                };
            }));

            return conversations;
        } catch (error) {
            console.error("Error getting conversations:", error);
            throw error;
        }
    },

    // Subscribe to Conversations (Real-time List)
    subscribeToConversations: (userId, callback) => {
        const conversationsRef = collection(db, 'conversations');
        // Removed orderBy to avoid requiring a composite index
        // We'll sort client-side instead
        const q = query(conversationsRef, where('participants', 'array-contains', userId));

        return onSnapshot(q, async (snapshot) => {
            // 1. Collect all unique user IDs that need fetching
            const otherUserIds = new Set();
            const conversationsMap = [];

            snapshot.docs.forEach(docSnap => {
                const data = docSnap.data();
                const otherUserId = data.participants.find(p => p !== userId);
                if (otherUserId) {
                    otherUserIds.add(otherUserId);
                }
                conversationsMap.push({
                    id: docSnap.id,
                    ...data,
                    otherUserId // store temporarily
                });
            });

            // 2. Filter out IDs we already have in cache
            const idsToFetch = [...otherUserIds].filter(id => !userProfileCache[id]);

            // 3. Fetch missing profiles in batches (Firestore 'in' limit is 10)
            if (idsToFetch.length > 0) {
                const batchPromises = [];
                // Chunk into arrays of 10
                for (let i = 0; i < idsToFetch.length; i += 10) {
                    const batch = idsToFetch.slice(i, i + 10);
                    if (batch.length > 0) {
                        const usersQuery = query(collection(db, 'users'), where(documentId(), 'in', batch));
                        batchPromises.push(getDocs(usersQuery));
                    }
                }

                try {
                    const paramsResults = await Promise.all(batchPromises);
                    paramsResults.forEach(querySnapshot => {
                        querySnapshot.docs.forEach(doc => {
                            userProfileCache[doc.id] = { _id: doc.id, ...doc.data() };
                        });
                    });

                    // Handle any IDs that weren't found (deleted users etc) to prevent re-fetching
                    idsToFetch.forEach(id => {
                        if (!userProfileCache[id]) {
                            userProfileCache[id] = { _id: id, username: 'Unknown User' };
                        }
                    });

                } catch (error) {
                    console.error("Error batch fetching users:", error);
                }
            }

            // 4. Assemble final result
            const conversations = conversationsMap.map(conv => {
                const otherUser = conv.otherUserId ?
                    (userProfileCache[conv.otherUserId] || { username: 'Loading...', _id: conv.otherUserId })
                    : { username: 'Unknown User' };

                const { otherUserId, ...rest } = conv;
                return {
                    ...rest,
                    otherUser
                };
            });

            // 5. Sort client-side by updatedAt (most recent first)
            conversations.sort((a, b) => {
                const aTime = a.updatedAt?.seconds || 0;
                const bTime = b.updatedAt?.seconds || 0;
                return bTime - aTime;
            });

            callback(conversations);
        });
    }
};
