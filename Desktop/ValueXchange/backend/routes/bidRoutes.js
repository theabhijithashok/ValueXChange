import express from 'express';
import {
    getBidsForListing,
    getMyBids,
    createBid,
    updateBidStatus
} from '../controllers/bidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/listing/:listingId', protect, getBidsForListing);
router.get('/my/bids', protect, getMyBids);
router.post('/', protect, createBid);
router.put('/:id', protect, updateBidStatus);

export default router;
