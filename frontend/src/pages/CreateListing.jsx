import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { resizeImage } from '../utils/imageUtils';
import { MIN_DESC_LENGTH, MAX_DESC_LENGTH } from '../utils/validation';

const CreateListing = () => {

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [imageProcessing, setImageProcessing] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'price') {
            const priceValue = parseFloat(value);
            // Check if value is not empty and invalid
            if (value !== '' && (isNaN(priceValue) || priceValue <= 0)) {
                setError('Invalid price');
            } else {
                // Clear error if it's currently showing the price error
                if (error === 'Invalid price') {
                    setError('');
                }
            }
        }

        if (name === 'description') {
            if (value.length < MIN_DESC_LENGTH) {
                setError(`Description must be at least ${MIN_DESC_LENGTH} characters`);
            } else if (value.length > MAX_DESC_LENGTH) {
                setError(`Description cannot exceed ${MAX_DESC_LENGTH} characters`);
            } else {
                if (error && error.includes('Description')) {
                    setError('');
                }
            }
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageProcessing(true);
            setError('');
            try {
                // Aggressive resize: 600px max, 0.6 quality to ensure fast upload
                const resizedImage = await resizeImage(file, 600, 0.6);
                setFormData(prev => ({
                    ...prev,
                    images: [resizedImage]
                }));
            } catch (err) {
                console.error("Error resizing image:", err);
                setError("Failed to process image. Please try another one.");
            } finally {
                setImageProcessing(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.images.length === 0) {
            setError('Please upload at least one image of your item');
            return;
        }

        const priceValue = parseFloat(formData.price);
        if (isNaN(priceValue) || priceValue <= 0) {
            setError('Invalid price');
            return;
        }

        if (formData.description.length < MIN_DESC_LENGTH || formData.description.length > MAX_DESC_LENGTH) {
            setError(`Description must be between ${MIN_DESC_LENGTH} and ${MAX_DESC_LENGTH} characters`);
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
                setError("The image is too large or connection failed. Please try a smaller image.");
            } else if (errorMessage.includes('permission-denied')) {
                setError("You don't have permission to create listings. Please try logging in again.");
            } else {
                setError(errorMessage);
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



                    {error && !error.includes('Invalid price') && !error.includes('Description') && !error.includes('Please upload') && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
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
                                {error && error.includes('Description') ? (
                                    <p className="text-red-500 text-sm">{error}</p>
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
                            <label className="block text-base font-semibold mb-2 text-black">Base Value</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border-none focus:ring-0 text-gray-700 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                required
                            />
                            {error && error.includes('Invalid price') && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
                            )}
                        </div>

                        {/* Upload Image */}
                        <div>
                            <label className="block text-base font-semibold mb-2 text-black">Upload image</label>
                            <div className="bg-white rounded-lg p-1 flex items-center mb-2">
                                <label className={`cursor-pointer bg-gray-200 hover:bg-gray-300 text-black text-sm font-medium py-1 px-3 rounded shadow-sm m-1 transition-colors border border-gray-300 ${imageProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {imageProcessing ? 'Processing...' : 'Choose File'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={imageProcessing}
                                    />
                                </label>
                                <span className="text-gray-500 text-sm ml-2">
                                    {imageProcessing ? 'Optimizing image...' : (formData.images.length > 0 ? 'Image ready' : 'No file chosen')}
                                </span>
                            </div>
                            {/* Image Preview */}
                            {!imageProcessing && formData.images.length > 0 && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-300 w-32 h-32 bg-white">
                                    <img
                                        src={formData.images[0]}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            {error && error.includes('Please upload') && (
                                <p className="text-red-500 text-sm mt-1">{error}</p>
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
