import React, { useState, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GlobalChat = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (!user || !isOpen) return;

        const unsubscribe = chatAPI.subscribeToConversations((realtimeConversations) => {
            setConversations(realtimeConversations);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user, isOpen]);

    useEffect(() => {
        let unsubscribe;
        if (selectedConversation && isOpen) {
            setChatLoading(true);
            setMessages([]);
            unsubscribe = chatAPI.subscribeToMessages(selectedConversation.id, (msgs) => {
                setMessages(msgs);
                setChatLoading(false);
            });
        }
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [selectedConversation, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            await chatAPI.sendMessage(selectedConversation.id, user.uid, newMessage);
            setNewMessage('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-16">
            <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
                {/* Conversations List */}
                <div className={`w-full md:w-1/3 border-r border-gray-100 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-black">Messages</h2>
                        <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:text-black">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <p>No conversations yet.</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 text-left ${selectedConversation?.id === conv.id ? 'bg-gray-50' : ''}`}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                                        {conv.otherUser?.photoURL ? (
                                            <img
                                                src={conv.otherUser.photoURL}
                                                alt={conv.otherUser.username || 'User'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{(conv.otherUser?.username || 'U').charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-semibold truncate text-black">{conv.otherUser?.username || 'Unknown User'}</h3>
                                            {conv.updatedAt?.seconds ? (
                                                <span className="text-xs text-gray-400">
                                                    {new Date(conv.updatedAt.seconds * 1000).toLocaleDateString()}
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-gray-500 truncate">
                                            {conv.lastMessage || 'Start conversation...'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className={`w-full md:w-2/3 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation ? (
                        <>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-black"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                                        {selectedConversation.otherUser?.photoURL ? (
                                            <img
                                                src={selectedConversation.otherUser.photoURL}
                                                alt={selectedConversation.otherUser.username || 'User'}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{(selectedConversation.otherUser?.username || 'U').charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-black">{selectedConversation.otherUser?.username || 'Unknown User'}</h3>
                                </div>
                                <button onClick={onClose} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                                {chatLoading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="text-center text-gray-400 mt-12">
                                        <p>Say hello!</p>
                                    </div>
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

                            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-6 py-3 bg-gray-50 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 text-black"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 relative">
                            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors md:block hidden">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <span className="text-6xl mb-4">💬</span>
                            <p className="text-lg">Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalChat;
