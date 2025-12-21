import React from 'react';
import { Link } from 'react-router-dom';
import HowItWorks from '../components/HowItWorks';

const LandingPage = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-white py-32 min-h-[60vh] flex items-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 tracking-tight">
                        VALUE GROWTH BARTER MARKETPLACE
                    </h1>
                    <p className="text-base md:text-lg text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Exchange goods, services, and skills without money. Join our community to revive the spirit of bartering with modern technology
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="btn btn-secondary px-8">
                            Get Started
                        </Link>
                        <Link to="/browse" className="btn btn-primary px-8">
                            Browse Listings
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <HowItWorks />

            {/* Features Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="section-title">Why Choose ValueXchange?</h2>
                    <p className="section-subtitle mb-12">
                        Experience dynamic value growth without using money
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-5xl mb-4"></div>
                            <h3 className="text-xl font-bold mb-3">Circular Economy</h3>
                            <p className="text-gray-600">
                                Promote sustainability by exchanging items instead of buying new ones
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-4"></div>
                            <h3 className="text-xl font-bold mb-3">Dynamic Value</h3>
                            <p className="text-gray-600">
                                Watch your items grow in value based on community demand and participation
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl mb-4"></div>
                            <h3 className="text-xl font-bold mb-3">Community Trust</h3>
                            <p className="text-gray-600">
                                Build trust through feedback and transparent exchange processes
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-black text-white py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">Ready to Start Bartering?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Join thousands of users exchanging value without money
                    </p>
                    <Link to="/register" className="btn bg-white text-black hover:bg-gray-100">
                        Create Your Account
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
