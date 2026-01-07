import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase.config';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const oobCode = searchParams.get('oobCode');
    const navigate = useNavigate();

    useEffect(() => {
        if (!oobCode) {
            setError('Invalid password reset link. Please try again.');
        }
    }, [oobCode]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!oobCode) {
            return setError('Missing reset code.');
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            await confirmPasswordReset(auth, oobCode, password);
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Token is invalid or has expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!oobCode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Invalid Link</h2>
                    <p className="text-gray-600 mb-6">This password reset link is invalid or missing the code.</p>
                    <Link to="/forgot-password" className="btn btn-primary inline-block">Request New Link</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-8 text-center">Reset Password</h2>

                <p className="text-gray-600 mb-6 text-center">
                    Enter your new password below.
                </p>

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
                    <div>
                        <label className="block text-sm font-medium mb-2">New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            required
                            minLength="6"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input-field"
                            required
                            minLength="6"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn btn-primary"
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                            Back to Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
