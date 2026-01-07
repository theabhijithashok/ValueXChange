import express from 'express';
import {
    getListings,
    getListing,
    createListing,
    updateListing,
    deleteListing,
    getMyListings
} from '../controllers/listingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getListings);
router.get('/my/listings', protect, getMyListings);
router.get('/:id', getListing);
router.post('/', protect, createListing);
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

export default router;
