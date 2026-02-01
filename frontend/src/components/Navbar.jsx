
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isScrolled, setIsScrolled] = useState(false);
    const isAdminRoute = location.pathname.startsWith('/admin');

    useEffect(() => {
        setIsChatOpen(false);
        setIsMobileMenuOpen(false);
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
                <div className="w-full px-4 sm:px-8">
                    <div className="flex justify-between items-center h-16">
                        {isAdminRoute ? (
                            <>
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <span className="text-lg sm:text-xl font-heading font-bold text-black">ValueXchange</span>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-base sm:text-lg text-gray-800">Admin</span>
                                </div>
                                <button onClick={handleLogout} className="btn btn-secondary text-xs sm:text-sm py-2 bg-black text-white hover:bg-gray-800">
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to={isAuthenticated ? "/home" : "/"} className="text-lg sm:text-xl font-heading font-bold text-black">
                                    ValueXchange
                                </Link>

                                {/* Desktop Navigation */}
                                {isAuthenticated ? (
                                    <>
                                        <div className="hidden md:flex items-center gap-4">
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

                                        {/* Mobile Hamburger Menu Button */}
                                        <button
                                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            aria-label="Toggle menu"
                                        >
                                            <svg
                                                className="w-6 h-6 text-black"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                {isMobileMenuOpen ? (
                                                    <path d="M6 18L18 6M6 6l12 12" />
                                                ) : (
                                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                                )}
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="hidden md:flex items-center gap-8">
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

                                        {/* Mobile Hamburger Menu Button (Unauthenticated) */}
                                        <button
                                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                            aria-label="Toggle menu"
                                        >
                                            <svg
                                                className="w-6 h-6 text-black"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                {isMobileMenuOpen ? (
                                                    <path d="M6 18L18 6M6 6l12 12" />
                                                ) : (
                                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                                )}
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {!isAdminRoute && (
                    <div
                        className={`md:hidden fixed top-16 left-0 right-0 bg-white shadow-lg transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                            }`}
                    >
                        <div className="px-4 py-4 space-y-3">
                            {isAuthenticated ? (
                                <>
                                    {/* User Info */}
                                    <div className="pb-3 border-b border-gray-200">
                                        <p className="text-sm text-gray-600">Signed in as</p>
                                        <p className="font-semibold text-black">{user?.username}</p>
                                    </div>

                                    <Link
                                        to="/home"
                                        className={`block py-3 px-4 rounded-lg transition-colors ${location.pathname === '/home'
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/browse"
                                        className={`block py-3 px-4 rounded-lg transition-colors ${location.pathname === '/browse'
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Browse Listings
                                    </Link>
                                    <Link
                                        to="/wishlist"
                                        className={`block py-3 px-4 rounded-lg transition-colors ${location.pathname === '/wishlist'
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Wishlist
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsChatOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="block w-full text-left py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        Chat
                                    </button>
                                    <Link
                                        to="/profile"
                                        className={`block py-3 px-4 rounded-lg transition-colors ${location.pathname === '/profile'
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Profile
                                    </Link>

                                    <div className="pt-3 border-t border-gray-200">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/"
                                        className={`block py-3 px-4 rounded-lg transition-colors ${location.pathname === '/'
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/#how-it-works"
                                        className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        How it works
                                    </Link>
                                    <Link
                                        to="/login"
                                        className={`block py-3 px-4 rounded-lg transition-colors ${location.pathname === '/login'
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className={`block py-3 px-4 rounded-lg transition-colors ${location.pathname === '/register'
                                            ? 'bg-black text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}

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
