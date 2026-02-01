import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListingDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Chat State
    const { user, updateProfile } = useAuth();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Wishlist State
    const [isInWishlist, setIsInWishlist] = useState(false);

    // Check if listing is in wishlist
    useEffect(() => {
        if (user && listing) {
            setIsInWishlist(user.wishlist?.includes(id) || false);
        }
    }, [user, listing, id]);

    // Toggle Wishlist
    const toggleWishlist = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const currentWishlist = user.wishlist || [];
        let newWishlist;

        if (isInWishlist) {
            // Remove from wishlist
            newWishlist = currentWishlist.filter(itemId => itemId !== id);
        } else {
            // Add to wishlist
            newWishlist = [...currentWishlist, id];
        }

        const result = await updateProfile({ wishlist: newWishlist });
        if (result.success) {
            setIsInWishlist(!isInWishlist);
        }
    };

    // Initialize Chat
    const handleStartChat = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Don't chat with yourself
        if (listing.owner?._id === user.uid || listing.owner === user.uid) {
            alert("You cannot chat with yourself!");
            return;
        }

        setIsChatOpen(true);
        setChatLoading(true);

        try {
            // Owner ID might be an object (enriched) or string
            const ownerId = listing.owner?._id || listing.owner;
            const res = await chatAPI.createConversation([user.uid, ownerId]);
            setConversationId(res.data.id);
            setChatLoading(false);
        } catch (err) {
            console.error("Failed to start chat", err);
            setChatLoading(false);
        }
    };

    // Subscribe to messages when conversationId is set
    useEffect(() => {
        let unsubscribe;
        if (conversationId && isChatOpen) {
            // Updated to handle synchronous return from subscribeToMessages
            unsubscribe = chatAPI.subscribeToMessages(conversationId, (msgs) => {
                setMessages(msgs);
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [conversationId, isChatOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId) return;

        try {
            await chatAPI.sendMessage(conversationId, user.uid, newMessage);
            setNewMessage('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await listingsAPI.getOne(id);
                setListing(response.data);
            } catch (err) {
                console.error("Error fetching listing:", err);
                setError('Failed to load listing details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchListing();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-12 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        );
    }

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-12 flex flex-col justify-center items-center text-center px-4">
                <h2 className="text-2xl font-bold mb-4 text-red-500">Oops!</h2>
                <p className="text-gray-600 mb-6">{error || 'Listing not found'}</p>
                <button
                    onClick={() => navigate('/browse')}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    Back to Browse
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center text-gray-600 hover:text-black transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
                    {/* Left Column - Image Gallery */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        {/* Main Image */}
                        <div className="bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 aspect-square flex items-center justify-center relative shadow-sm">
                            {listing.images && listing.images.length > 0 ? (
                                <img
                                    src={listing.images[activeImageIndex]}
                                    alt={listing.title}
                                    className="w-full h-full object-contain p-4 transition-opacity duration-300"
                                />
                            ) : (
                                <span className="text-6xl">📦</span>
                            )}
                            <div className="absolute top-4 right-4">
                                {/* Category removed from here */}
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {listing.images && listing.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto py-2 px-1">
                                {listing.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImageIndex(idx)}
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${activeImageIndex === idx ? 'border-black shadow-md scale-105' : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="flex flex-col lg:col-span-3">
                        <div className="mb-6">
                            <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">{listing.title}</h1>
                            <div className="flex items-center text-gray-500 text-sm">
                                <span>Listed by{' '}
                                    <span
                                        onClick={() => navigate(`/user/${listing.owner?._id || listing.owner}`)}
                                        className="font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                    >
                                        {listing.owner?.username || listing.owner?.email || listing.userId || 'Unknown User'}
                                    </span>
                                </span>
                                <span className="mx-2">•</span>
                                <span>{new Date(listing.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                                {listing.location && (
                                    <>
                                        <span className="mx-2">•</span>
                                        <span>in <span className="font-semibold text-black">{listing.location}</span></span>
                                    </>
                                )}
                            </div>
                            <div className="mt-4">
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-gray-200">
                                    {listing.category}
                                </span>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
                            <p className="text-sm text-gray-500 mb-1 uppercase tracking-wider font-semibold">Estimated Value</p>
                            <p className="text-4xl font-bold text-black">₹{listing.price || listing.valueRating || 0}</p>
                        </div>

                        <div className="prose prose-lg mb-8 text-gray-700">
                            <h3 className="text-lg font-bold text-black mb-2">Description</h3>
                            <p>{listing.description}</p>
                        </div>

                        <div className="mt-auto flex gap-4">
                            <button
                                className="flex-1 bg-black text-white text-lg font-bold py-4 px-8 rounded-xl hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                onClick={() => alert('Place bid functionality coming soon!')}
                            >
                                Place Bid
                            </button>
                            <button
                                className="flex-1 bg-white text-black border-2 border-black text-lg font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                                onClick={handleStartChat}
                            >
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat
                            </button>
                            <button
                                onClick={toggleWishlist}
                                className="bg-white border-2 border-black text-black p-4 rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                                title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill={isInWishlist ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Modal */}
            {isChatOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
                        {/* Header */}
                        <div className="bg-gray-100 p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">Chat with {listing.owner?.username || 'Seller'}</h3>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="text-gray-500 hover:text-black hover:bg-gray-200 rounded-full p-1 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                            {chatLoading ? (
                                <div className="flex justify-center py-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                </div>
                            ) : messages.length === 0 ? (
                                <p className="text-center text-gray-400 mt-10">No messages yet. Say hi!</p>
                            ) : (
                                messages.map((msg, index) => {
                                    const isMe = msg.senderId === user.uid;

                                    // Date Separator Logic
                                    let showDateSeparator = false;
                                    let dateLabel = '';

                                    if (msg.createdAt?.seconds) {
                                        const currentDate = new Date(msg.createdAt.seconds * 1000);
                                        const previousDate = index > 0 && messages[index - 1].createdAt?.seconds
                                            ? new Date(messages[index - 1].createdAt.seconds * 1000)
                                            : null;

                                        if (!previousDate || currentDate.toDateString() !== previousDate.toDateString()) {
                                            showDateSeparator = true;
                                            const today = new Date();
                                            const yesterday = new Date(today);
                                            yesterday.setDate(yesterday.getDate() - 1);

                                            if (currentDate.toDateString() === today.toDateString()) {
                                                dateLabel = 'Today';
                                            } else if (currentDate.toDateString() === yesterday.toDateString()) {
                                                dateLabel = 'Yesterday';
                                            } else {
                                                dateLabel = currentDate.toLocaleDateString();
                                            }
                                        }
                                    }

                                    return (
                                        <div key={msg.id} className="w-full">
                                            {showDateSeparator && (
                                                <div className="flex justify-center my-4">
                                                    <span className="bg-gray-100 text-gray-500 text-xs py-1 px-3 rounded-full shadow-sm">
                                                        {dateLabel}
                                                    </span>
                                                </div>
                                            )}
                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${isMe
                                                    ? 'bg-black text-white rounded-br-none'
                                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                                    }`}>
                                                    <p>{msg.text}</p>
                                                </div>
                                                <p className={`text-[10px] mt-1 ${isMe ? 'text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}>
                                                    {msg.createdAt?.seconds
                                                        ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : '...'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t bg-white flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-gray-50"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListingDetails;
