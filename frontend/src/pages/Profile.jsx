import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { listingService, bidService } from '../services/firestore';
import { MIN_DESC_LENGTH, MAX_DESC_LENGTH } from '../utils/validation';
import { Link, useLocation } from 'react-router-dom';
import LocationAutocomplete from '../components/LocationAutocomplete';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
    const [username, setUsername] = useState(user?.username || '');
    const [usernameError, setUsernameError] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Data states
    const [myListings, setMyListings] = useState([]);
    const [receivedOffers, setReceivedOffers] = useState([]);
    const [editingListing, setEditingListing] = useState(null); // State for the listing being edited
    const [editError, setEditError] = useState(''); // State for edit modal validation errors

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

    const validateUsername = (value) => {
        if (value.trim().length < 3) {
            return 'Username must be at least 3 characters long.';
        }
        if (value.length > 20) {
            return 'Username cannot exceed 20 characters.';
        }
        // Only allow alphanumeric characters and underscores
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Username can only contain letters, numbers, and underscores.';
        }
        return '';
    };

    const handleUsernameChange = (e) => {
        const value = e.target.value;
        setUsername(value);
        const error = validateUsername(value);
        setUsernameError(error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Final validation check
        const validationError = validateUsername(username);
        if (validationError) {
            setUsernameError(validationError);
            return;
        }

        setLoading(true);
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

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditingListing(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear previous errors when user starts typing
        setEditError('');

        if (name === 'title') {
            if (value.trim().length < 3) {
                setEditError('Title must be at least 3 characters');
            } else if (value.length > 100) {
                setEditError('Title cannot exceed 100 characters');
            }
        }

        if (name === 'price') {
            // Only allow positive numbers
            const priceValue = parseFloat(value);

            if (value !== '') {
                // Check if it's a valid number
                if (isNaN(priceValue) || priceValue <= 0) {
                    setEditError('Price must be a positive number');
                }
                // Minimum price: ₹1
                else if (priceValue < 1) {
                    setEditError('Price must be at least ₹1');
                }
                // Maximum price: ₹10 crores (reasonable upper limit for marketplace)
                else if (priceValue > 100000000) {
                    setEditError('Price cannot exceed ₹10,00,00,000');
                }
            }
        }

        if (name === 'description') {
            if (value.length < MIN_DESC_LENGTH) {
                setEditError(`Description must be at least ${MIN_DESC_LENGTH} characters`);
            } else if (value.length > MAX_DESC_LENGTH) {
                setEditError(`Description cannot exceed ${MAX_DESC_LENGTH} characters`);
            }
        }
    };

    const handleEditLocationChange = (newLocation) => {
        setEditingListing(prev => ({
            ...prev,
            location: newLocation
        }));
        setEditError('');
    };

    const handleUpdateListing = async (e) => {
        e.preventDefault();
        if (!editingListing) return;
        setEditError('');

        // Final Validation before submit
        if (editingListing.title.trim().length < 3) {
            setEditError('Title must be at least 3 characters');
            return;
        }

        if (editingListing.title.length > 100) {
            setEditError('Title cannot exceed 100 characters');
            return;
        }

        if (!editingListing.location || editingListing.location.trim() === '') {
            setEditError('Please enter a location');
            return;
        }

        const priceValue = parseFloat(editingListing.price);
        if (isNaN(priceValue) || priceValue <= 0) {
            setEditError('Price must be a positive number');
            return;
        }

        if (priceValue < 1) {
            setEditError('Price must be at least ₹1');
            return;
        }

        if (priceValue > 100000000) {
            setEditError('Price cannot exceed ₹10,00,00,000');
            return;
        }

        if (editingListing.description.length < MIN_DESC_LENGTH || editingListing.description.length > MAX_DESC_LENGTH) {
            setEditError(`Description must be between ${MIN_DESC_LENGTH} and ${MAX_DESC_LENGTH} characters`);
            return;
        }

        setLoading(true);
        try {
            const { id, title, location, price, category, description } = editingListing;
            await listingService.update(id, { title, location, price, category, description });

            setMyListings(prev => prev.map(l => l.id === id ? { ...l, title, location, price, category, description } : l));
            setEditingListing(null);
            setMessage("Listing updated successfully!");
        } catch (err) {
            console.error("Error updating listing", err);
            setError("Failed to update listing.");
        } finally {
            setLoading(false);
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
                                            onChange={handleUsernameChange}
                                            className={`input-field ${usernameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                            placeholder="Enter your display name"
                                        />
                                        {usernameError ? (
                                            <p className="text-xs text-red-500 mt-1">
                                                {usernameError}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-gray-500 mt-1">
                                                This will be displayed on your listings and bids.
                                            </p>
                                        )}
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading || !!usernameError || username.trim().length === 0}
                                            className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                <div className="flex items-center gap-4">
                                                    {/* Image Preview */}
                                                    <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                                                        {listing.images && listing.images.length > 0 ? (
                                                            <img
                                                                src={listing.images[0]}
                                                                alt={listing.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <h3 className="font-bold text-lg mb-1">{listing.title}</h3>
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-gray-500">
                                                                Price: <span className="text-black font-medium">₹{listing.price}</span>
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Category: {listing.category}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Created: {listing.createdAt?.seconds ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingListing(listing);
                                                            setEditError('');
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteListing(listing.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Edit Listing Modal */}
                        {editingListing && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                                    <h3 className="text-xl font-bold mb-4">Edit Listing</h3>
                                    <form onSubmit={handleUpdateListing} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={editingListing.title || ''}
                                                onChange={handleEditChange}
                                                className={`input-field ${editError && editError.includes('Title') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                required
                                            />
                                            {editError && editError.includes('Title') && (
                                                <p className="text-red-500 text-sm mt-1">{editError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Location</label>
                                            <LocationAutocomplete
                                                value={editingListing.location || ''}
                                                onChange={handleEditLocationChange}
                                                placeholder="e.g. New York, NY"
                                                className="input-field"
                                                required={true}
                                            />
                                            {editError && editError.includes('location') && (
                                                <p className="text-red-500 text-sm mt-1">{editError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={editingListing.price || ''}
                                                onChange={handleEditChange}
                                                onKeyDown={(e) => {
                                                    // Prevent minus sign, plus sign, and 'e' (exponential notation)
                                                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                                min="1"
                                                max="100000000"
                                                step="1"
                                                className={`input-field [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${editError && editError.includes('Price') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                required
                                            />
                                            {editError && editError.includes('Price') && (
                                                <p className="text-red-500 text-sm mt-1">{editError}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category</label>
                                            <select
                                                name="category"
                                                value={editingListing.category || ''}
                                                onChange={handleEditChange}
                                                className="input-field"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                <option value="Electronics">Electronics</option>
                                                <option value="Furniture">Furniture</option>
                                                <option value="Books">Books</option>
                                                <option value="Clothing">Clothing</option>
                                                <option value="Vehicles">Vehicles</option>
                                                <option value="Services">Services</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Description</label>
                                            <textarea
                                                name="description"
                                                value={editingListing.description || ''}
                                                onChange={handleEditChange}
                                                className={`input-field min-h-[100px] ${editError && editError.includes('Description') ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                required
                                                minLength={MIN_DESC_LENGTH}
                                                maxLength={MAX_DESC_LENGTH}
                                            />
                                            <div className="flex justify-between items-start mt-1">
                                                {editError && editError.includes('Description') ? (
                                                    <p className="text-red-500 text-sm">{editError}</p>
                                                ) : (
                                                    <span></span>
                                                )}
                                                <span className={`text-xs ${editingListing.description.length >= MAX_DESC_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {editingListing.description.length}/{MAX_DESC_LENGTH}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => setEditingListing(null)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading || !!editError}
                                                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
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
        </div >
    );
};

export default Profile;
