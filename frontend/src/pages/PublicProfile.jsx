import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';

const PublicProfile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProfile();
    }, [userId]);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authAPI.getPublicProfile(userId);
            setProfile(response.data);
        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load user profile. User may not exist.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'This user profile does not exist.'}</p>
                    <button
                        onClick={() => navigate('/browse')}
                        className="btn btn-primary"
                    >
                        Browse Listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {profile.photoURL ? (
                                <img
                                    src={profile.photoURL}
                                    alt={profile.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl sm:text-4xl font-bold text-white">
                                    {profile.username?.charAt(0).toUpperCase() || '?'}
                                </span>
                            )}
                        </div>

                        {/* User Details */}
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                                {profile.username}
                            </h1>

                            <div className="space-y-2">
                                {/* Location */}
                                {profile.location && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm sm:text-base">{profile.location}</span>
                                    </div>
                                )}

                                {/* Member Since */}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-sm sm:text-base">Member since {formatDate(profile.createdAt)}</span>
                                </div>

                                {/* Listings Count */}
                                <div className="flex items-center gap-2 text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="text-sm sm:text-base font-medium">
                                        {profile.listingsCount} {profile.listingsCount === 1 ? 'Listing' : 'Listings'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Section */}
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                        {profile.username}'s Listings
                    </h2>

                    {profile.listings && profile.listings.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {profile.listings.map((listing) => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    onWishlistToggle={user ? null : null}
                                    isInWishlist={false}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-600 text-lg mb-4">
                                {profile.username} hasn't listed anything yet
                            </p>
                            {user?.uid === userId && (
                                <button
                                    onClick={() => navigate('/create-listing')}
                                    className="btn btn-primary"
                                >
                                    Create Your First Listing
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
