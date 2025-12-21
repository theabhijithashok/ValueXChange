import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';

const ScrollToHashElement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const navType = useNavigationType(); // 'POP', 'PUSH', or 'REPLACE'
    const hasHandledReload = useRef(false);

    useEffect(() => {
        // Disable default browser scroll restoration to have full control
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        // Only run this logic once per component mount (page load)
        if (!hasHandledReload.current) {
            const navigationEntry = performance.getEntriesByType("navigation")[0];
            const isReload = navigationEntry && navigationEntry.type === 'reload';

            if (isReload) {
                // Force smooth scroll to top on reload
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

                // If there's a hash, clear it cleanly
                if (location.hash) {
                    navigate(location.pathname, { replace: true });
                }

                hasHandledReload.current = true;
                return;
            }
            hasHandledReload.current = true;
        }

        // Handle Back/Forward (POP) navigation
        if (navType === 'POP') {
            // If we are on the landing page (root or empty path)
            if (location.pathname === '/') {
                window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                // If there's a hash lingering from history, clear it
                if (location.hash) {
                    navigate(location.pathname, { replace: true });
                    return;
                }
            }
        }

        if (location.hash) {
            const removeHashCharacter = (str) => {
                const result = str.slice(1);
                return result;
            };

            const scrollToElement = () => {
                const element = document.getElementById(removeHashCharacter(location.hash));
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
                    return true;
                }
                return false;
            };

            if (!scrollToElement()) {
                const timer = setTimeout(() => {
                    scrollToElement();
                }, 100);
                return () => clearTimeout(timer);
            }
        } else {
            // Normal navigation to non-hash routes -> Scroll to top
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
    }, [location, navigate, navType]);

    return null;
};

export default ScrollToHashElement;
