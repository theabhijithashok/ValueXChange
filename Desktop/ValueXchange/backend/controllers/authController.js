import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email }, { username }] });

        if (userExists) {
            return res.status(400).json({
                message: userExists.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        // Create user
        const user = await User.create({
            username,
            email,
            password
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('wishlist');
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

// @desc    Add to wishlist
// @route   POST /api/auth/wishlist/:listingId
// @access  Private
export const addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const listingId = req.params.listingId;

        if (user.wishlist.includes(listingId)) {
            return res.status(400).json({ message: 'Listing already in wishlist' });
        }

        user.wishlist.push(listingId);
        await user.save();

        res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ message: 'Server error adding to wishlist' });
    }
};

// @desc    Remove from wishlist
// @route   DELETE /api/auth/wishlist/:listingId
// @access  Private
export const removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const listingId = req.params.listingId;

        user.wishlist = user.wishlist.filter(id => id.toString() !== listingId);
        await user.save();

        res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ message: 'Server error removing from wishlist' });
    }
};

// @desc    Google Login
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
    try {
        const { tokenId } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Update googleId if user exists by email but doesn't have googleId
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new user for Google login
            // For username, we can use the name or a part of email
            const username = name.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
            user = await User.create({
                username,
                email,
                googleId,
                // password is not required for google users
            });
        }

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(400).json({ message: 'Google login failed' });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: `ValueXchange <${process.env.EMAIL_USERNAME}>`,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Hi,\n\nYou are receiving this email because you (or someone else) have requested the reset of a password. \n\n Please click on the following link, or paste this into your browser to complete the process: \n\n ${resetUrl}`
        };

        await transporter.sendMail(mailOptions);

        res.json({ message: 'Email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error sending email' });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};
