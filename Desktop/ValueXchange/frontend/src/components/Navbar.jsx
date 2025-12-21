import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-gray-100 border-b border-gray-300 w-full">
            <div className="w-full px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to={isAuthenticated ? "/home" : "/"} className="text-xl font-heading font-bold text-black">
                        ValueXchange
                    </Link>

                    <div className="flex items-center gap-8">
                        {isAuthenticated ? (
                            <>
                                <Link to="/home" className="text-sm text-gray-700 hover:text-black transition-colors">
                                    Home
                                </Link>
                                <Link to="/browse" className="text-sm text-gray-700 hover:text-black transition-colors">
                                    Browse Listings
                                </Link>
                                <Link to="/wishlist" className="text-sm text-gray-700 hover:text-black transition-colors">
                                    Wishlist
                                </Link>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
                                    <button onClick={handleLogout} className="btn btn-secondary text-sm py-2">
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/" className="text-sm text-gray-700 hover:text-black transition-colors">
                                    Home
                                </Link>
                                <Link to="/#how-it-works" className="text-sm text-gray-700 hover:text-black transition-colors">
                                    How it works
                                </Link>
                                <Link to="/login" className="text-sm text-gray-700 hover:text-black transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="text-sm text-gray-700 hover:text-black transition-colors">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
