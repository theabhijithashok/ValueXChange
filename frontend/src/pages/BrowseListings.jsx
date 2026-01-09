import React, { useState, useEffect } from 'react';
import { listingsAPI } from '../services/api';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const BrowseListings = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        search: ''
    });
    const { user } = useAuth();
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        fetchListings();
        if (user && user.wishlist) {
            setWishlist(user.wishlist);
        }
    }, [filters, user]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filters.category) params.category = filters.category;
            if (filters.search) params.search = filters.search;

            const response = await listingsAPI.getAll(params);
            setListings(response.data);
        } catch (error) {
            setError('Failed to load listings');
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWishlistToggle = async (listingId) => {
        try {
            const isInWishlist = wishlist.some(id => id === listingId);

            if (isInWishlist) {
                await authAPI.removeFromWishlist(listingId);
                setWishlist(wishlist.filter(id => id !== listingId));
            } else {
                await authAPI.addToWishlist(listingId);
                setWishlist([...wishlist, listingId]);
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* <h1 className="text-4xl font-bold mb-8">Browse Listings</h1> */ /* Removed header to better match mockup if needed, or keeping it but checking spacing */}

                {/* Search Bar */}
                <div className="mb-12">
                    <div className="flex max-w-lg">
                        <input
                            type="text"
                            placeholder=""
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="flex-1 bg-[#D9D9D9] border border-black border-r-0 px-4 py-2 outline-none"
                        />
                        <button className="bg-black text-white px-6 py-2 border border-black flex items-center gap-2">
                            <span className="transform rotate-0">⌕</span> Search
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading listings...</p>
                    </div>
                ) : (
                    <>
                        {/* Listings Grid */}
                        {listings.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {listings.map((listing) => (
                                    <ListingCard
                                        key={listing._id}
                                        listing={listing}
                                        onWishlistToggle={user ? handleWishlistToggle : null}
                                        isInWishlist={wishlist.some(id => id === listing._id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600 text-lg">No listings found</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BrowseListings;
