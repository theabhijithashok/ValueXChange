import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userService, listingService, bidService } from '../services/firestore';

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [users, setUsers] = useState([]);
    const [listings, setListings] = useState([]);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const stats = [
        { title: 'Total Users', value: users.length },
        { title: 'Active Listings', value: listings.filter(l => l.status === 'active').length },
        { title: 'Total Transactions', value: bids.length },
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
                    {['dashboard', 'users', 'listings'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors capitalize ${activeTab === tab ? 'bg-gray-300 text-black' : 'text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {tab === 'dashboard' ? 'Dashboard' :
                                tab === 'users' ? 'Manage Users' :
                                    tab === 'listings' ? 'Manage Listings' : tab}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 ml-64 overflow-y-auto">
                {activeTab === 'dashboard' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col items-center justify-center h-32 hover:shadow-md transition-shadow">
                                    <h3 className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">{stat.title}</h3>
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map(user => (
                                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-gray-900">{user.username || 'N/A'}</td>
                                            <td className="px-6 py-4">{user.email}</td>
                                            <td className="px-6 py-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                    {user.role || 'user'}
                                                </span>
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
