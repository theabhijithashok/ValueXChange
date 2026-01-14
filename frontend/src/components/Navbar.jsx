
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isAdminRoute = location.pathname.startsWith('/admin');

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    const confirmLogout = () => {
        logout();
        setShowLogoutConfirm(false);
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutConfirm(false);
    };

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
                }`}>
                <div className="w-full px-8">
                    <div className="flex justify-between items-center h-16">
                        {isAdminRoute ? (
                            <>
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-heading font-bold text-black">ValueXchange</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-lg text-gray-800">Admin</span>
                                </div>
                                <button onClick={handleLogout} className="btn btn-secondary text-sm py-2 bg-white border border-black text-black hover:bg-gray-100">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to={isAuthenticated ? "/home" : "/"} className="text-xl font-heading font-bold text-black">
                                    ValueXchange
                                </Link>

                                {isAuthenticated ? (
                                    <div className="flex items-center gap-4">
                                        <Link to="/home" className="text-sm text-gray-700 hover:text-black transition-colors">
                                            Home
                                        </Link>
                                        <Link to="/browse" className="text-sm text-gray-700 hover:text-black transition-colors">
                                            Browse Listings
                                        </Link>
                                        <Link to="/wishlist" className="text-sm text-gray-700 hover:text-black transition-colors">
                                            Wishlist
                                        </Link>

                                        <Link to="/profile" className="flex items-center gap-2 group">
                                            <span className="text-sm text-gray-600 group-hover:text-black transition-colors">
                                                Welcome, {user?.username}
                                            </span>

                                        </Link>
                                        <button onClick={handleLogout} className="btn btn-secondary text-sm py-2">
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-8">
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
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

            </nav >

            {/* Logout Confirmation Modal */}
            {
                showLogoutConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
                                <p className="text-sm text-gray-500 mb-6">Are you sure you want to logout?</p>

                                <div className="flex gap-3 justify-center">
                                    <button
                                        onClick={cancelLogout}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmLogout}
                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default Navbar;
