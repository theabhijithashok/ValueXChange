import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HowItWorks from '../components/HowItWorks';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-50 to-gray-100 pt-20 sm:pt-28 md:pt-32 pb-12 sm:pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
                        Welcome {user?.username}
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed px-4">
                        Explore new barter opportunities, place value-based bids, and experience dynamic value
                        growth without using money.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 max-w-md sm:max-w-none mx-auto">
                        <Link to="/create-listing" className="btn btn-secondary w-full sm:w-auto">
                            Create a listing
                        </Link>
                        <Link to="/browse" className="btn btn-primary w-full sm:w-auto">
                            Browser listings
                        </Link>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <HowItWorks />

            {/* Quick Stats */}

        </div>
    );
};

export default Home;
