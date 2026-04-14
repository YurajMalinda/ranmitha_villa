'use client'

import { motion } from 'framer-motion';

export function WhatsAppButton() {
    return (
        <motion.a
            href="https://wa.me/94718116780"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full shadow-lg shadow-[#25D366]/40 flex items-center justify-center"
        >
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 32 32" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.489-2.001A15.93 15.93 0 0 0 16 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.073 22.34c-.334.94-1.95 1.8-2.686 1.914-.688.107-1.558.153-2.512-.158a23.1 23.1 0 0 1-2.274-.84c-4.003-1.73-6.617-5.77-6.814-6.036-.197-.265-1.609-2.14-1.609-4.081s1.018-2.896 1.38-3.293c.362-.396.789-.495 1.052-.495.264 0 .528.002.759.014.243.013.569-.092.891.68.334.8 1.134 2.74 1.233 2.938.1.198.166.43.033.693-.134.264-.2.43-.396.661-.198.23-.416.514-.594.69-.197.197-.402.41-.173.804.23.396 1.019 1.68 2.187 2.72 1.503 1.34 2.77 1.754 3.167 1.952.396.198.627.166.858-.1.23-.264.99-1.155 1.254-1.551.264-.396.528-.33.891-.198.362.133 2.3 1.085 2.695 1.282.396.198.66.297.759.462.1.166.1.96-.234 1.9z"/>
            </svg>

            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
        </motion.a>
    );
}
