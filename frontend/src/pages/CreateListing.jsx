import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { resizeImage } from '../utils/imageUtils';
import { MIN_DESC_LENGTH, MAX_DESC_LENGTH } from '../utils/validation';
import LocationAutocomplete from '../components/LocationAutocomplete';

const CreateListing = () => {

    const [formData, setFormData] = useState({
        title: '',
        location: '',
        description: '',
        category: '',
        price: '',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        // Real-time price validation
        if (name === 'price' && value !== '') {
            const priceValue = parseFloat(value);
            if (isNaN(priceValue) || priceValue <= 0) {
                setErrors(prev => ({ ...prev, price: 'Price must be a positive number' }));
            } else if (priceValue < 1) {
                setErrors(prev => ({ ...prev, price: 'Price must be at least ₹1' }));
            } else if (priceValue > 100000000) {
                setErrors(prev => ({ ...prev, price: 'Price cannot exceed ₹10,00,00,000' }));
            }
        }
    };

    const handleLocationChange = (newLocation) => {
        setFormData(prev => ({
            ...prev,
            location: newLocation
        }));
        if (errors.location) {
            setErrors(prev => ({ ...prev, location: '' }));
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (formData.images.length >= 3) {
                setErrors(prev => ({ ...prev, images: "You can only upload up to 3 images." }));
                return;
            }

            setImageProcessing(true);
            setErrors(prev => ({ ...prev, images: '' })); // Clear image error
            try {
                // Aggressive resize: 600px max, 0.6 quality to ensure fast upload
                const resizedImage = await resizeImage(file, 600, 0.6);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, resizedImage]
                }));
            } catch (err) {
                console.error("Error resizing image:", err);
                setErrors(prev => ({ ...prev, images: "Failed to process image. Please try another one." }));
            } finally {
                setImageProcessing(false);
                // Reset file input
                e.target.value = '';
            }
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        const newErrors = {};

        // Validation
        if (formData.images.length === 0) {
            newErrors.images = 'Please upload at least one image of your item';
        }

        if (!formData.location || formData.location.trim() === '') {
            newErrors.location = 'Please enter a location';
        }

        if (!formData.title || formData.title.trim() === '') {
            newErrors.title = 'Title is required';
        }

        if (!formData.category || formData.category === '') {
            newErrors.category = 'Category is required';
        }

        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0) {
            newErrors.price = 'Price must be a positive number';
        } else if (priceValue < 1) {
            newErrors.price = 'Price must be at least ₹1';
        } else if (priceValue > 100000000) {
            newErrors.price = 'Price cannot exceed ₹10,00,00,000';
        }

        if (formData.description.length < MIN_DESC_LENGTH) {
            newErrors.description = `Description must be at least ${MIN_DESC_LENGTH} characters`;
        } else if (formData.description.length > MAX_DESC_LENGTH) {
            newErrors.description = `Description cannot exceed ${MAX_DESC_LENGTH} characters`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            // Create a timeout promise
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out. Please check your internet connection and try again.')), 15000);
            });

            // Race the API call against the timeout
            await Promise.race([
                listingsAPI.create({
                    ...formData,
                    price: parseFloat(formData.price) || 0,
                    valueRating: 3 // Default value rating
                }),
                timeout
            ]);

            navigate('/profile', { state: { activeTab: 'listings' } });
        } catch (error) {
            console.error("Listing creation failed:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to create listing';

            // Helpful messages for common Firestore errors
            if (errorMessage.includes('storage/object-not-found') || errorMessage.includes('resource-exhausted')) {
                setSubmitError("The image is too large or connection failed. Please try a smaller image.");
            } else if (errorMessage.includes('permission-denied')) {
                setSubmitError("You don't have permission to create listings. Please try logging in again.");
            } else {
                setSubmitError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 flex justify-center">
            <div className="w-full max-w-2xl px-4">

                <div className="bg-gray-200 rounded-3xl p-8 shadow-sm">
                    <h1 className="text-3xl font-bold mb-8 text-black">Create new listing</h1>



                    {submitError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Listing Title */}
                        <div>
                            <label className="block text-base font-semibold mb-2 text-black">Listing Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-none focus:ring-0 text-gray-700 bg-white placeholder-gray-400"
                                placeholder="Enter item name"
                                required
                            />
                            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-base font-semibold mb-2 text-black">Location</label>
                            <LocationAutocomplete
                                value={formData.location}
                                onChange={handleLocationChange}
                                placeholder="e.g. New York, NY"
                                required={true}
                            />
                            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-base font-semibold mb-2 text-black">Category</label>
                            <div className="relative">
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border-none focus:ring-0 text-gray-700 bg-white appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" disabled>Select category</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Furniture">Furniture</option>
                                    <option value="Books">Books</option>
                                    <option value="Clothing">Clothing</option>
                                    <option value="Vehicles">Vehicles</option>
                                    <option value="Other">Other</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-4 h-4 text-black" fill="bg-black" viewBox="0 0 20 20" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-base font-semibold mb-2 text-black">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-none focus:ring-0 text-gray-700 bg-white placeholder-gray-400 resize-none"
                                rows={4}
                                placeholder="Describe your item"
                                required
                                minLength={MIN_DESC_LENGTH}
                                maxLength={MAX_DESC_LENGTH}
                            />
                            <div className="flex justify-between items-start mt-1">
                                {errors.description ? (
                                    <p className="text-red-500 text-sm">{errors.description}</p>
                                ) : (
                                    <span></span>
                                )}
                                <span className={`text-xs ${formData.description.length >= MAX_DESC_LENGTH ? 'text-red-500' : 'text-gray-500'}`}>
                                    {formData.description.length}/{MAX_DESC_LENGTH}
                                </span>
                            </div>
                        </div>

                        {/* Base Value */}
                        <div>
                            <label className="block text-base font-semibold mb-2 text-black">Base Value (₹)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                onKeyDown={(e) => {
                                    // Prevent minus sign, plus sign, and 'e' (exponential notation)
                                    if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                        e.preventDefault();
                                    }
                                }}
                                min="1"
                                max="100000000"
                                step="1"
                                className="w-full px-4 py-3 rounded-lg border-none focus:ring-0 text-gray-700 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                required
                            />
                            {errors.price && (
                                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                            )}
                        </div>

                        {/* Upload Image */}
                        <div>
                            <label className="block text-base font-semibold mb-2 text-black">Upload images (Max 3)</label>

                            <div className="flex flex-wrap gap-4 mb-2">
                                {/* Image Previews */}
                                {formData.images.map((img, index) => (
                                    <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-300 bg-white group">
                                        <img
                                            src={img}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                                            title="Remove image"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}

                                {/* Add Button */}
                                {formData.images.length < 3 && (
                                    <label className={`w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50 transition-all ${imageProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                        {imageProcessing ? (
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                                        ) : (
                                            <>
                                                <svg className="w-8 h-8 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                                <span className="text-xs text-gray-500 font-medium">Add Photo</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                            disabled={imageProcessing}
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-gray-500 text-xs text-right">{formData.images.length}/3 images</p>

                            {errors.images && (
                                <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading || imageProcessing}
                                className={`bg-black text-white font-bold py-3 px-8 rounded-lg transition-colors ${loading || imageProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                            >
                                {loading ? 'Creating...' : (imageProcessing ? 'Processing Image...' : 'Create listing')}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/browse')}
                                className="bg-white text-black font-medium py-3 px-8 rounded-lg border border-black hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
};

export default CreateListing;
