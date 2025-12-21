import React from 'react';

const HowItWorks = () => {
    const steps = [
        {
            title: 'Create a Listing',
            description: 'List your goods, services, or skills that you want to exchange with others in the community.'
        },
        {
            title: 'Place Bids or Offers',
            description: "Browse listings and make offers on items you're interested in. Negotiate with other users."
        },
        {
            title: 'Value Grows Dynamically',
            description: "Watch as your item's value increases based on demand, bids, and community participation."
        },
        {
            title: 'Complete Barter & Feedback',
            description: 'Finalize the exchange and provide feedback to build trust within the community.'
        }
    ];

    return (
        <section id="how-it-works" className="py-16 bg-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="section-title">HOW IT WORKS</h2>
                <p className="section-subtitle mb-12">Simple steps to start bartering</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map((step, index) => (
                        <div key={index} className="card p-6 hover:scale-105 transition-transform duration-200">
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                                {index + 1}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
