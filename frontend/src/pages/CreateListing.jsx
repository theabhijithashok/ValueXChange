import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';

const CreateListing = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Goods',
        valueRating: 3
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await listingsAPI.create(formData);
            navigate('/browse');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">Create a Listing</h1>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="What are you offering?"
                                required
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field"
                                rows={5}
                                placeholder="Describe your item or service in detail..."
                                required
                                maxLength={1000}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input-field"
                                required
                            >
                                <option value="Goods">Goods</option>
                                <option value="Services">Services</option>
                                <option value="Skills">Skills</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Value Rating: {formData.valueRating} / 5
                            </label>
                            <input
                                type="range"
                                name="valueRating"
                                min="1"
                                max="5"
                                value={formData.valueRating}
                                onChange={handleChange}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Low Value</span>
                                <span>High Value</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 btn btn-primary"
                            >
                                {loading ? 'Creating...' : 'Create Listing'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/browse')}
                                className="flex-1 btn btn-secondary"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateListing;
