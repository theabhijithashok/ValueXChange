import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HowItWorks from '../components/HowItWorks';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Welcome {user?.username}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                        Explore new barter opportunities, place value-based bids, and experience dynamic value
                        growth without using money.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/create-listing" className="btn btn-secondary">
                            Create a listing
                        </Link>
                        <Link to="/browse" className="btn btn-primary">
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
