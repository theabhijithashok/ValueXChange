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
    const { user, updateProfile } = useAuth();
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

            // Filter out own listings if user is logged in
            let fetchedListings = response.data;
            if (user) {
                fetchedListings = fetchedListings.filter(listing => listing.owner?._id !== user.uid);
            }

            setListings(fetchedListings);
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

            let newWishlist;
            if (isInWishlist) {
                newWishlist = wishlist.filter(id => id !== listingId);
            } else {
                newWishlist = [...wishlist, listingId];
            }

            // Optimistic Update
            setWishlist(newWishlist);

            // Update Context and DB
            const result = await updateProfile({ wishlist: newWishlist });
            if (!result.success) {
                // Revert on failure
                setWishlist(wishlist);
                console.error('Failed to update wishlist:', result.message);
            }
        } catch (error) {
            console.error('Wishlist toggle error:', error);
            // Revert on error
            setWishlist(wishlist);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Bar */}
                <div className="mb-8 sm:mb-12">
                    <div className="flex w-full sm:max-w-lg gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder='Search by title, description, or category...'
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full bg-[#D9D9D9] border border-black rounded-lg px-4 py-2 pr-12 outline-none placeholder:text-gray-500 placeholder:opacity-60"
                            />
                            <button
                                onClick={fetchListings}
                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                                aria-label="Search"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </div>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {listings.map((listing) => (
                                    <ListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onWishlistToggle={user ? handleWishlistToggle : null}
                                        isInWishlist={wishlist.some(id => id === listing.id)}
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
