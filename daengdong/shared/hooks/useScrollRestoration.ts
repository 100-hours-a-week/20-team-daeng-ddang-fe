import { useEffect, useState, RefObject } from 'react';

interface UseScrollRestorationProps {
    ref: RefObject<HTMLElement | null>;
    storageKey: string;
    threshold?: number;
}

export function useScrollRestoration({ ref, storageKey, threshold = 300 }: UseScrollRestorationProps) {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const contentEl = ref.current;
        if (!contentEl) return;

        const savedScroll = sessionStorage.getItem(storageKey);
        if (savedScroll) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (ref.current) {
                        ref.current.scrollTop = Number(savedScroll);
                    }
                });
            });
        }

        const handleScroll = () => {
            setShowScrollTop(contentEl.scrollTop > threshold);
            sessionStorage.setItem(storageKey, contentEl.scrollTop.toString());
        };

        contentEl.addEventListener('scroll', handleScroll);
        return () => contentEl.removeEventListener('scroll', handleScroll);
    }, [ref, storageKey, threshold]);

    const scrollToTop = () => {
        ref.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return { showScrollTop, scrollToTop };
}
