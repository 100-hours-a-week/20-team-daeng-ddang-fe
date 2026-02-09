import { useState, useEffect } from 'react';

export const useOnboarding = (storageKey: string) => {
    const [showOnboarding, setShowOnboarding] = useState(() => {
        if (typeof window === 'undefined') return false;
        const hasVisited = localStorage.getItem(storageKey);
        return !hasVisited;
    });

    useEffect(() => {
        if (showOnboarding) {
            localStorage.setItem(storageKey, 'true');
        }
    }, [storageKey, showOnboarding]);

    const openOnboarding = () => {
        setShowOnboarding(true);
    };

    const closeOnboarding = () => {
        setShowOnboarding(false);
    };

    return {
        showOnboarding,
        openOnboarding,
        closeOnboarding,
    };
};
