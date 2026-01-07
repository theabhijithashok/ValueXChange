import React from 'react';
import { Link } from 'react-router-dom';

const ListingCard = ({ listing, onWishlistToggle, isInWishlist }) => {
    const categoryColors = {
        Goods: 'bg-blue-100 text-blue-800',
        Services: 'bg-green-100 text-green-800',
        Skills: 'bg-purple-100 text-purple-800',
        Other: 'bg-gray-100 text-gray-800'
    };

    return (
        <div className="card overflow-hidden group">
            <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                    <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="text-6xl">📦</div>
                )}
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${categoryColors[listing.category]}`}>
                    {listing.category}
                </span>
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold mb-2 line-clamp-1">{listing.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-lg ${i < listing.valueRating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                            </span>
                        ))}
                    </div>
                    <span className="text-xs text-gray-500">by {listing.owner?.username || 'Unknown'}</span>
                </div>

                <div className="flex gap-2">
                    <Link
                        to={`/listing/${listing._id}`}
                        className="flex-1 btn btn-primary text-sm py-2 text-center"
                    >
                        View Details
                    </Link>
                    {onWishlistToggle && (
                        <button
                            onClick={() => onWishlistToggle(listing._id)}
                            className={`btn text-sm py-2 px-4 ${isInWishlist ? 'btn-primary' : 'btn-secondary'}`}
                            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {isInWishlist ? '❤️' : '🤍'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
