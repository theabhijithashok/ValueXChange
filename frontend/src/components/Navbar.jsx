
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlobalChat from './GlobalChat';


const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const [isScrolled, setIsScrolled] = useState(false);
    const isAdminRoute = location.pathname.startsWith('/admin');

    useEffect(() => {
        setIsChatOpen(false);
    }, [location.pathname]);

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
                                <button onClick={handleLogout} className="btn btn-secondary text-sm py-2 bg-black text-white hover:bg-gray-800">
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
                                        <Link
                                            to="/home"
                                            className={`text-sm transition-colors pb-1 border-b-2 ${location.pathname === '/home'
                                                    ? 'text-black border-black font-medium'
                                                    : 'text-gray-700 border-transparent hover:text-black hover:border-gray-300'
                                                }`}
                                        >
                                            Home
                                        </Link>
                                        <Link
                                            to="/browse"
                                            className={`text-sm transition-colors pb-1 border-b-2 ${location.pathname === '/browse'
                                                    ? 'text-black border-black font-medium'
                                                    : 'text-gray-700 border-transparent hover:text-black hover:border-gray-300'
                                                }`}
                                        >
                                            Browse Listings
                                        </Link>
                                        <Link
                                            to="/wishlist"
                                            className={`text-sm transition-colors pb-1 border-b-2 ${location.pathname === '/wishlist'
                                                    ? 'text-black border-black font-medium'
                                                    : 'text-gray-700 border-transparent hover:text-black hover:border-gray-300'
                                                }`}
                                        >
                                            Wishlist
                                        </Link>

                                        <button
                                            onClick={() => setIsChatOpen(true)}
                                            className={`text-sm transition-colors pb-1 border-b-2 ${isChatOpen
                                                    ? 'text-black border-black font-medium'
                                                    : 'text-gray-700 border-transparent hover:text-black hover:border-gray-300'
                                                }`}
                                        >
                                            Chat
                                        </button>


                                        <Link
                                            to="/profile"
                                            className={`flex items-center gap-2 group pb-1 border-b-2 ${location.pathname === '/profile'
                                                    ? 'border-black'
                                                    : 'border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <span className={`text-sm transition-colors ${location.pathname === '/profile'
                                                    ? 'text-black font-medium'
                                                    : 'text-gray-600 group-hover:text-black'
                                                }`}>
                                                Welcome, {user?.username}
                                            </span>

                                        </Link>
                                        <button onClick={handleLogout} className="btn btn-secondary text-sm py-2 bg-black text-white hover:bg-gray-800">
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-8">
                                        <Link
                                            to="/"
                                            className={`text-sm transition-colors pb-1 border-b-2 ${location.pathname === '/'
                                                    ? 'text-black border-black font-medium'
                                                    : 'text-gray-700 border-transparent hover:text-black hover:border-gray-300'
                                                }`}
                                        >
                                            Home
                                        </Link>
                                        <Link
                                            to="/#how-it-works"
                                            className="text-sm text-gray-700 hover:text-black transition-colors pb-1 border-b-2 border-transparent hover:border-gray-300"
                                        >
                                            How it works
                                        </Link>
                                        <Link
                                            to="/login"
                                            className={`text-sm transition-colors pb-1 border-b-2 ${location.pathname === '/login'
                                                    ? 'text-black border-black font-medium'
                                                    : 'text-gray-700 border-transparent hover:text-black hover:border-gray-300'
                                                }`}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/register"
                                            className={`text-sm transition-colors pb-1 border-b-2 ${location.pathname === '/register'
                                                    ? 'text-black border-black font-medium'
                                                    : 'text-gray-700 border-transparent hover:text-black hover:border-gray-300'
                                                }`}
                                        >
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
            <GlobalChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        </>
    );
};

export default Navbar;
