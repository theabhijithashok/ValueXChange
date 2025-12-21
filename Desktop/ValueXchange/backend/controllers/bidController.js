import Bid from '../models/Bid.js';
import Listing from '../models/Listing.js';

// @desc    Get bids for a listing
// @route   GET /api/bids/listing/:listingId
// @access  Private
export const getBidsForListing = async (req, res) => {
    try {
        const bids = await Bid.find({ listing: req.params.listingId })
            .populate('bidder', 'username email')
            .populate('listing', 'title')
            .sort({ createdAt: -1 });

        res.json(bids);
    } catch (error) {
        console.error('Get bids error:', error);
        res.status(500).json({ message: 'Server error fetching bids' });
    }
};

// @desc    Get user's bids
// @route   GET /api/bids/my/bids
// @access  Private
export const getMyBids = async (req, res) => {
    try {
        const bids = await Bid.find({ bidder: req.user._id })
            .populate('listing', 'title description category')
            .sort({ createdAt: -1 });

        res.json(bids);
    } catch (error) {
        console.error('Get my bids error:', error);
        res.status(500).json({ message: 'Server error fetching your bids' });
    }
};

// @desc    Create new bid
// @route   POST /api/bids
// @access  Private
export const createBid = async (req, res) => {
    try {
        const { listing, offeredItems, message } = req.body;

        // Check if listing exists
        const listingExists = await Listing.findById(listing);

        if (!listingExists) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if user is trying to bid on their own listing
        if (listingExists.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot bid on your own listing' });
        }

        const bid = await Bid.create({
            listing,
            bidder: req.user._id,
            offeredItems,
            message
        });

        const populatedBid = await Bid.findById(bid._id)
            .populate('bidder', 'username email')
            .populate('listing', 'title description');

        res.status(201).json(populatedBid);
    } catch (error) {
        console.error('Create bid error:', error);
        res.status(500).json({ message: 'Server error creating bid' });
    }
};

// @desc    Update bid status
// @route   PUT /api/bids/:id
// @access  Private
export const updateBidStatus = async (req, res) => {
    try {
        const bid = await Bid.findById(req.params.id).populate('listing');

        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        // Only listing owner can update bid status
        if (bid.listing.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this bid' });
        }

        const { status } = req.body;

        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        bid.status = status;
        await bid.save();

        const populatedBid = await Bid.findById(bid._id)
            .populate('bidder', 'username email')
            .populate('listing', 'title description');

        res.json(populatedBid);
    } catch (error) {
        console.error('Update bid error:', error);
        res.status(500).json({ message: 'Server error updating bid' });
    }
};
