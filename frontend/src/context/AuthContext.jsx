import React, { createContext, useState, useContext, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,

    signOut,
    signInWithPopup,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase.config';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = async (uid, email = '') => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                // Backfill username if missing
                if (!data.username && email) {
                    const generatedUsername = email.split('@')[0];
                    await updateDoc(userDocRef, { username: generatedUsername });
                    return { ...data, username: generatedUsername };
                }
                return data;
            } else if (email) {
                // Create profile if it doesn't exist
                const generatedUsername = email.split('@')[0];
                const newProfile = {
                    email: email,
                    username: generatedUsername,
                    wishlist: [],
                    createdAt: new Date().toISOString()
                };
                try {
                    await setDoc(userDocRef, newProfile);
                    return newProfile;
                } catch (writeErr) {
                    console.error("Error creating profile:", writeErr);
                    // Fallback to local data if write fails (e.g. offline)
                    return newProfile;
                }
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            // On error (e.g. offline), try to reconstruct minimal profile from email
            if (email) {
                return {
                    username: email.split('@')[0],
                    email: email,
                    wishlist: []
                };
            }
        }
        return null;
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Pass email to allow generating username if needed
                const profile = await fetchUserProfile(firebaseUser.uid, firebaseUser.email);
                setUser({ ...firebaseUser, ...profile });
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const updateProfile = async (data) => {
        try {
            if (!user) throw new Error("No user logged in");

            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, data);

            // Update local state
            setUser(prev => ({ ...prev, ...data }));
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    const login = async ({ email, password }) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Optimistic update: Set minimal user immediately to allow redirect
            // Profile will be auto-fetched by onAuthStateChanged in background
            setUser({
                ...firebaseUser,
                username: firebaseUser.email.split('@')[0],
                wishlist: []
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    };

    const register = async ({ email, password, username }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userData = {
                email: user.email,
                username: username,
                wishlist: [],
                createdAt: new Date().toISOString()
            };

            // Create user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), userData);

            // Set user state immediately
            setUser({ ...user, ...userData });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    };

    const googleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Optimistic update
            setUser({
                ...user,
                username: user.displayName || user.email.split('@')[0],
                wishlist: [],
                googleId: user.providerData[0].uid
            });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    };

    const forgotPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        googleLogin,
        forgotPassword,
        updateProfile,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
