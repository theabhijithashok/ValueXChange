import React, { useState, useEffect, useRef } from 'react';

const LocationAutocomplete = ({ value, onChange, placeholder, required, className }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const wrapperRef = useRef(null);

    // Sync internal state with external value prop
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        // Close suggestions when clicking outside
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
            );
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounce the API call - only when user has interacted
    useEffect(() => {
        if (!hasUserInteracted) return;

        const timer = setTimeout(() => {
            fetchSuggestions(inputValue);
        }, 500);

        return () => clearTimeout(timer);
    }, [inputValue, hasUserInteracted]);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        setHasUserInteracted(true); // Mark that user has started typing
        onChange(val); // Propagate text change immediately
    };

    const handleSelectSuggestion = (e, suggestion) => {
        // Prevent form submission and event bubbling
        e.preventDefault();
        e.stopPropagation();

        // Format the address nicely
        // Use display_name or construct from address parts
        // display_name is usually good but long.
        // Let's try to grab city, state, country if available, or just use display_name

        let formattedLocation = suggestion.display_name;
        // Simple heuristic to shorten it if needed, but display_name is reliable

        setInputValue(formattedLocation);
        onChange(formattedLocation);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className={className || "w-full px-4 py-3 rounded-lg border-none focus:ring-0 text-gray-700 bg-white placeholder-gray-400"}
                placeholder={placeholder}
                required={required}
            />

            {isLoading && (
                <div className="absolute right-3 top-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-60 overflow-y-auto">
                    {suggestions.map((item) => (
                        <li
                            key={item.place_id}
                            onClick={(e) => handleSelectSuggestion(e, item)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-none text-sm text-gray-700 flex flex-col"
                        >
                            <span className="font-medium text-gray-900">{item.display_name.split(',')[0]}</span>
                            <span className="text-xs text-gray-500 truncate">{item.display_name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LocationAutocomplete;
