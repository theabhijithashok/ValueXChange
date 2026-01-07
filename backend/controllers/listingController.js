import Listing from '../models/Listing.js';

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
export const getListings = async (req, res) => {
    try {
        const { category, status, search } = req.query;

        let query = {};

        if (category) {
            query.category = category;
        }

        if (status) {
            query.status = status;
        } else {
            query.status = 'active'; // Default to active listings
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const listings = await Listing.find(query)
            .populate('owner', 'username email')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (error) {
        console.error('Get listings error:', error);
        res.status(500).json({ message: 'Server error fetching listings' });
    }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
export const getListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id)
            .populate('owner', 'username email');

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        res.json(listing);
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({ message: 'Server error fetching listing' });
    }
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private
export const createListing = async (req, res) => {
    try {
        const { title, description, category, images, valueRating } = req.body;

        const listing = await Listing.create({
            title,
            description,
            category,
            images: images || [],
            valueRating: valueRating || 3,
            owner: req.user._id
        });

        const populatedListing = await Listing.findById(listing._id)
            .populate('owner', 'username email');

        res.status(201).json(populatedListing);
    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ message: 'Server error creating listing' });
    }
};

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private
export const updateListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if user is the owner
        if (listing.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this listing' });
        }

        const { title, description, category, images, valueRating, status } = req.body;

        listing.title = title || listing.title;
        listing.description = description || listing.description;
        listing.category = category || listing.category;
        listing.images = images !== undefined ? images : listing.images;
        listing.valueRating = valueRating || listing.valueRating;
        listing.status = status || listing.status;

        const updatedListing = await listing.save();
        const populatedListing = await Listing.findById(updatedListing._id)
            .populate('owner', 'username email');

        res.json(populatedListing);
    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ message: 'Server error updating listing' });
    }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private
export const deleteListing = async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Check if user is the owner
        if (listing.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this listing' });
        }

        await listing.deleteOne();

        res.json({ message: 'Listing removed' });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ message: 'Server error deleting listing' });
    }
};

// @desc    Get user's own listings
// @route   GET /api/listings/my/listings
// @access  Private
export const getMyListings = async (req, res) => {
    try {
        const listings = await Listing.find({ owner: req.user._id })
            .populate('owner', 'username email')
            .sort({ createdAt: -1 });

        res.json(listings);
    } catch (error) {
        console.error('Get my listings error:', error);
        res.status(500).json({ message: 'Server error fetching your listings' });
    }
};
