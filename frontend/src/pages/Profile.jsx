import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        // Basic validation
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

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                    {/* Feedback Messages */}
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email (Read Only) */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-500">Email (Cannot be changed)</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="input-field bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        {/* Username (Editable) */}
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
                                className="btn btn-primary w-full sm:w-auto"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
