import express from 'express';
import { register, login, getMe, addToWishlist, removeFromWishlist, googleLogin, forgotPassword, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/wishlist/:listingId', protect, addToWishlist);
router.delete('/wishlist/:listingId', protect, removeFromWishlist);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

export default router;
