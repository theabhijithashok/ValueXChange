import React from 'react';
import { useNavigate } from 'react-router-dom';

const ListingCard = ({ listing, onWishlistToggle, isInWishlist }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/listing/${listing.id}`)}
            className="bg-[#E5E5E5] border border-gray-400 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative cursor-pointer">
            {/* Image Container */}
            <div className="h-40 sm:h-48 w-full p-3 pb-0">
                <div className="w-full h-full rounded-lg overflow-hidden border border-gray-300 bg-white flex items-center justify-center">
                    {listing.images && listing.images.length > 0 ? (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="text-4xl">📦</div>
                    )}
                </div>
            </div>

            <div className="p-3 sm:p-4 pt-2">
                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-black mb-1 line-clamp-1">{listing.title}</h3>

                {/* Category */}
                <p className="text-sm text-black mb-1">
                    Category: <span className="font-bold">{listing.category}</span>
                </p>

                {/* Owner */}
                {listing.owner && listing.owner.username && (
                    <p className="text-xs text-gray-600 mb-2">
                        by{' '}
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/user/${listing.owner._id}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                        >
                            {listing.owner.username}
                        </span>
                    </p>
                )}

                {/* Current Value */}
                <p className="text-sm text-black mb-4">
                    Current Value: <span className="font-bold">₹{listing.price || listing.valueRating || 0}</span>
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end">
                    {onWishlistToggle && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onWishlistToggle(listing.id);
                            }}
                            className="p-2 hover:scale-110 transition-transform"
                            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            {isInWishlist ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-red-500 fill-current" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListingCard;
