import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    offeredItems: {
        type: String,
        required: [true, 'Please describe what you are offering'],
        trim: true,
        maxlength: [500, 'Offer description cannot exceed 500 characters']
    },
    message: {
        type: String,
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
