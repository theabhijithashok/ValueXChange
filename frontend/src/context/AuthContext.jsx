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

    const checkUserBlocked = async (uid) => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                return userData.status === 'blocked';
            }
            return false;
        } catch (error) {
            console.error("Error checking user status:", error);
            return false;
        }
    };

    const fetchUserProfile = async (uid, email = '', photoURL = '') => {
        try {
            const userDocRef = doc(db, 'users', uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                // Backfill username if missing
                let updates = {};
                let updatedData = { ...data };

                if (!data.username && email) {
                    const generatedUsername = email.split('@')[0];
                    updates.username = generatedUsername;
                    updatedData.username = generatedUsername;
                }

                // Sync photoURL if provided and different
                if (photoURL && data.photoURL !== photoURL) {
                    updates.photoURL = photoURL;
                    updatedData.photoURL = photoURL;
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(userDocRef, updates);
                }

                return updatedData;
            } else if (email) {
                // Create profile if it doesn't exist
                const generatedUsername = email.split('@')[0];
                const newProfile = {
                    email: email,
                    username: generatedUsername,
                    photoURL: photoURL || '',
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
                // Check if user is blocked
                const isBlocked = await checkUserBlocked(firebaseUser.uid);
                if (isBlocked) {
                    // Sign out blocked user immediately
                    await signOut(auth);
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // Pass email and photoURL to allow generating username/syncing photo if needed
                const profile = await fetchUserProfile(firebaseUser.uid, firebaseUser.email, firebaseUser.photoURL);
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

            // Check if user is blocked
            const isBlocked = await checkUserBlocked(firebaseUser.uid);
            if (isBlocked) {
                // Sign out immediately if blocked
                await signOut(auth);
                return {
                    success: false,
                    message: "Your account has been blocked. Please contact support."
                };
            }

            // Optimistic update: Set minimal user immediately to allow redirect
            // Profile will be auto-fetched by onAuthStateChanged in background
            setUser({
                ...firebaseUser,
                username: firebaseUser.email.split('@')[0],
                wishlist: []
            });

            return { success: true };
        } catch (error) {
            let message = error.message;
            if (error.code === 'auth/invalid-credential' || error.message.includes('invalid-credential')) {
                message = "Invalid email or password";
            }
            return {
                success: false,
                message
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

            // Check if user is blocked
            const isBlocked = await checkUserBlocked(user.uid);
            if (isBlocked) {
                // Sign out immediately if blocked
                await signOut(auth);
                return {
                    success: false,
                    message: "Your account has been blocked. Please contact support."
                };
            }

            // Optimistic update
            setUser({
                ...user,
                username: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL || '',
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
