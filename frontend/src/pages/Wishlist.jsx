import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ListingCard from '../components/ListingCard';

const Wishlist = () => {
    const { user, updateProfile } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = async () => {
        try {
            const response = await authAPI.getWishlist();
            setWishlistItems(response.data.wishlist || []);
        } catch (error) {
            console.error('Failed to load wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFromWishlist = async (listingId) => {
        try {
            // Optimistic update for UI
            const updatedItems = wishlistItems.filter(item => item.id !== listingId);
            setWishlistItems(updatedItems);

            // Sync with Context and DB
            // We need to pass the list of IDs, not objects
            const newWishlistIds = user?.wishlist ? user.wishlist.filter(id => id !== listingId) : [];
            await updateProfile({ wishlist: newWishlistIds });

        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            // Could revert local state here if needed
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">My Wishlist</h1>

                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {wishlistItems.map((listing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onWishlistToggle={handleRemoveFromWishlist}
                                isInWishlist={true}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <div className="flex justify-center mb-4">
                            <img
                                src="https://img.freepik.com/premium-vector/broken-heart-icon-symbol-heartbreak-vector-illustration-eps-10_797523-3099.jpg"
                                alt="Empty Wishlist"
                                className="h-32 w-32 object-contain mix-blend-multiply"
                            />
                        </div>
                        <p className="text-gray-600 text-lg mb-4">Your wishlist is empty</p>
                        <a href="/browse" className="btn btn-primary inline-block">
                            Browse Listings
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
