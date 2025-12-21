import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ScrollToHashElement from './components/ScrollToHashElement';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import BrowseListings from './pages/BrowseListings';
import CreateListing from './pages/CreateListing';
import Wishlist from './pages/Wishlist';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { GoogleOAuthProvider } from '@react-oauth/google';

const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/home" /> : <LandingPage />}
            />
            <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
            />
            <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/home" /> : <Register />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/browse" element={<BrowseListings />} />

            {/* Protected Routes */}
            <Route
                path="/home"
                element={
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/create-listing"
                element={
                    <ProtectedRoute>
                        <CreateListing />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/wishlist"
                element={
                    <ProtectedRoute>
                        <Wishlist />
                    </ProtectedRoute>
                }
            />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

function App() {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <Router>
                <AuthProvider>
                    <div className="min-h-screen flex flex-col">
                        <ScrollToHashElement />
                        <Navbar />
                        <main className="flex-1">
                            <AppRoutes />
                        </main>
                        <footer className="bg-gray-900 text-white py-8">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                                <p>&copy; 2024 ValueXchange. All rights reserved.</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Reviving the spirit of bartering with modern technology
                                </p>
                            </div>
                        </footer>
                    </div>
                </AuthProvider>
            </Router>
        </GoogleOAuthProvider>
    );
}

export default App;
