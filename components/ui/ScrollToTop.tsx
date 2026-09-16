'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Scroll to top"
                    className="fixed bottom-24 right-6 z-50 w-11 h-11 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full shadow-md flex items-center justify-center text-[#2E5D4B] dark:text-emerald-400 hover:bg-[#2E5D4B] dark:hover:bg-emerald-400 hover:text-white dark:hover:text-slate-950 hover:border-[#2E5D4B] dark:hover:border-emerald-400 transition-colors duration-200"
                >
                    <ChevronUp className="w-5 h-5" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
