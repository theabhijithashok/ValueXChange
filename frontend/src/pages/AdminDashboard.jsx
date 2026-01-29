import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService, listingService, bidService } from '../services/firestore';

const AdminDashboard = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, listingId: null, listingTitle: '' });
    const [deleteReason, setDeleteReason] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, listingsData, bidsData] = await Promise.all([
                    userService.getAll(),
                    listingService.getAll('All'),
                    bidService.getAll()
                ]);

                setUsers(usersData);
                setListings(listingsData);
                setBids(bidsData);
            } catch (error) {
                console.error("Error fetching admin data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleBlockUser = async (userId, currentStatus) => {
        if (window.confirm(`Are you sure you want to ${currentStatus === 'blocked' ? 'unblock' : 'block'} this user?`)) {
            try {
                const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
                await userService.updateStatus(userId, newStatus);
                setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            } catch (error) {
                console.error("Error updating user status:", error);
                alert("Failed to update user status");
            }
        }
    };

    const handleDeleteListing = (listing) => {
        setDeleteModal({ show: true, listingId: listing.id, listingTitle: listing.title });
        setDeleteReason('');
    };

    const confirmDelete = async () => {
        if (!deleteReason.trim()) {
            alert("Please provide a reason for deletion");
            return;
        }

        try {
            await listingService.delete(deleteModal.listingId, deleteReason, user.uid);
            setListings(listings.filter(l => l.id !== deleteModal.listingId));
            setDeleteModal({ show: false, listingId: null, listingTitle: '' });
            setDeleteReason('');
        } catch (error) {
            console.error("Error deleting listing:", error);
            alert("Failed to delete listing");
        }
    };

    const cancelDelete = () => {
        setDeleteModal({ show: false, listingId: null, listingTitle: '' });
        setDeleteReason('');
    };

    const stats = [
        { title: 'Total Users', value: users.length },
        { title: 'Active Listings', value: listings.filter(l => l.status === 'active').length },
        { title: 'Closed Listings', value: listings.filter(l => l.status !== 'active').length },
        { title: 'Accepted Bids', value: bids.filter(b => b.status === 'accepted').length },
        { title: 'Completed Exchanges', value: bids.filter(b => b.status === 'completed').length },
    ];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans pt-16">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-200 border-r border-gray-300 flex flex-col fixed h-full z-10">
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {['dashboard', 'users', 'listings', 'bids'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors capitalize ${activeTab === tab ? 'bg-gray-300 text-black' : 'text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {tab === 'dashboard' ? 'Dashboard' :
                                tab === 'users' ? 'Manage Users' :
                                    tab === 'listings' ? 'Manage Listings' :
                                        tab === 'bids' ? 'Manage Bids' : tab}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                {activeTab === 'dashboard' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center h-32 hover:shadow-md transition-shadow">
                                    <h3 className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wider text-center">{stat.title}</h3>
                                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity Sections */}
                        <div className="space-y-8">
                            {/* Recent Users Preview */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
                                    <button onClick={() => setActiveTab('users')} className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-600">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                            <tr>
                                                <th className="px-6 py-3">Username</th>
                                                <th className="px-6 py-3">Email</th>
                                                <th className="px-6 py-3">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {users.slice(0, 5).map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{user.username || 'N/A'}</td>
                                                    <td className="px-6 py-4">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                            {user.role || 'user'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Manage Users</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Username</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Joined</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{user.username || 'N/A'}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {user.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                    {user.status || 'active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleBlockUser(user.id, user.status)}
                                                        className={`text-xs px-3 py-1 rounded border ${user.status === 'blocked' ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                                                    >
                                                        {user.status === 'blocked' ? 'Unblock' : 'Block'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Manage Listings</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Category</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {listings.map(listing => (
                                        <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{listing.title}</td>
                                            <td className="px-6 py-4">{listing.category}</td>
                                            <td className="px-6 py-4 font-medium">₹{listing.price}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {listing.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{listing.createdAt && listing.createdAt.toDate ? new Date(listing.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleDeleteListing(listing)}
                                                    className="text-xs px-3 py-1 rounded border border-red-600 text-red-600 hover:bg-red-50"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'bids' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900">Manage Bids & Negotiations</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-3">Listing</th>
                                        <th className="px-6 py-3">Bidder</th>
                                        <th className="px-6 py-3">Amounts / Offer</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {bids.map(bid => (
                                        <tr key={bid.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{bid.listing?.title || 'Unknown Listing'}</td>
                                            <td className="px-6 py-4">{bid.bidder?.username || 'Unknown User'}</td>
                                            <td className="px-6 py-4 font-medium">₹{bid.amount || bid.offer || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                                    bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                        bid.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {bid.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{bid.createdAt && bid.createdAt.toDate ? new Date(bid.createdAt.toDate()).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bids.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    No bids found.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Listing</h3>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to delete <span className="font-semibold">"{deleteModal.listingTitle}"</span>?
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for deletion <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={deleteReason}
                                onChange={(e) => setDeleteReason(e.target.value)}
                                placeholder="Enter the reason for removing this listing..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                rows="4"
                            />
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete Listing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
