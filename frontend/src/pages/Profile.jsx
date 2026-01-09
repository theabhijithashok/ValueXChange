import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listingService, bidService } from '../services/firestore';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [username, setUsername] = useState(user?.username || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Data states
    const [myListings, setMyListings] = useState([]);
    const [receivedOffers, setReceivedOffers] = useState([]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Always fetch listings to show count in dashboard
            const listings = await listingService.getMyListings(user.uid);
            setMyListings(listings);

            if (activeTab === 'offers' || activeTab === 'profile') {
                // Fetch offers for dashboard counts too
                const allBids = [];
                for (const listing of listings) {
                    const bids = await bidService.getForListing(listing.id);
                    allBids.push(...bids.map(b => ({ ...b, listingTitle: listing.title })));
                }
                setReceivedOffers(allBids);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Failed to load data.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters long.');
            setLoading(false);
            return;
        }

        const result = await updateProfile({ username });

        if (result.success) {
            setMessage('Profile updated successfully!');
        } else {
            setError('Failed to update profile: ' + result.message);
        }
        setLoading(false);
    };

    const handleDeleteListing = async (listingId) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                await listingService.delete(listingId);
                setMyListings(prev => prev.filter(l => l.id !== listingId));
                setMessage("Listing deleted.");
            } catch (err) {
                console.error("Error deleting listing", err);
                setError("Failed to delete listing.");
            }
        }
    };

    const handleOfferAction = async (bidId, status) => {
        try {
            await bidService.updateStatus(bidId, status);
            setReceivedOffers(prev => prev.map(bid => bid.id === bidId ? { ...bid, status } : bid));
            setMessage(`Offer ${status}.`);
        } catch (err) {
            console.error("Error updating offer", err);
            setError("Failed to update offer status.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Tabs Header */}
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'profile'
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'listings'
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                My Listings
                            </button>
                            <button
                                onClick={() => setActiveTab('offers')}
                                className={`w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'offers'
                                    ? 'border-black text-black'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Received Offers
                            </button>
                        </nav>
                    </div>

                    <div className="p-8">
                        {/* Global Messages */}
                        {message && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                                {message}
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {/* TAB 1: Profile Info */}
                        {activeTab === 'profile' && (
                            <div className="max-w-xl mx-auto">
                                {/* Dashboard Overview */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div
                                        onClick={() => setActiveTab('listings')}
                                        className="bg-blue-50 p-6 rounded-xl border border-blue-100 cursor-pointer hover:shadow-md transition-all group"
                                    >
                                        <h3 className="text-blue-800 font-semibold mb-1 group-hover:text-blue-900">My Listings</h3>
                                        <p className="text-3xl font-bold text-blue-900">{myListings.length}</p>
                                        <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                            View Listings <span>→</span>
                                        </p>
                                    </div>
                                    <div
                                        onClick={() => setActiveTab('offers')}
                                        className="bg-purple-50 p-6 rounded-xl border border-purple-100 cursor-pointer hover:shadow-md transition-all group"
                                    >
                                        <h3 className="text-purple-800 font-semibold mb-1 group-hover:text-purple-900">Received Offers</h3>
                                        <p className="text-3xl font-bold text-purple-900">{receivedOffers.length}</p>
                                        <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
                                            View Offers <span>→</span>
                                        </p>
                                    </div>
                                </div>

                                <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-gray-500">Email</label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="input-field"
                                            placeholder="Enter your display name"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            This will be displayed on your listings and bids.
                                        </p>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn btn-primary w-full"
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* TAB 2: My Listings */}
                        {activeTab === 'listings' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">My Active Listings</h2>
                                {loading ? (
                                    <p className="text-gray-500">Loading listings...</p>
                                ) : myListings.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 mb-4">You haven't posted any listings yet.</p>
                                        <Link to="/create-listing" className="btn btn-primary">Create Listing</Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {myListings.map(listing => (
                                            <div key={listing.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center bg-white hover:shadow-sm transition-shadow">
                                                <div>
                                                    <h3 className="font-bold text-lg">{listing.title}</h3>
                                                    <p className="text-sm text-gray-500">Price: <span className="text-black font-medium">₹{listing.price}</span> • Category: {listing.category}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteListing(listing.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: Received Offers */}
                        {activeTab === 'offers' && (
                            <div>
                                <h2 className="text-2xl font-bold mb-6">Received Offers</h2>
                                {loading ? (
                                    <p className="text-gray-500">Loading offers...</p>
                                ) : receivedOffers.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No offers received yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {receivedOffers.map(offer => (
                                            <div key={offer.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium text-gray-900">{offer.bidder?.username || 'Unknown User'}</span>
                                                            <span className="text-sm text-gray-500">offered on</span>
                                                            <span className="font-bold text-black">{offer.listingTitle}</span>
                                                        </div>
                                                        <p className="text-lg font-bold text-green-600 mb-1">
                                                            ${offer.amount}
                                                            {offer.item && <span className="text-sm font-normal text-gray-600"> + {offer.item}</span>}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{offer.message}</p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        {offer.status === 'pending' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleOfferAction(offer.id, 'accepted')}
                                                                    className="btn bg-green-600 text-white hover:bg-green-700 px-4 py-2 text-sm"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleOfferAction(offer.id, 'rejected')}
                                                                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 px-4 py-2 text-sm"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize
                                                                ${offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                {offer.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
