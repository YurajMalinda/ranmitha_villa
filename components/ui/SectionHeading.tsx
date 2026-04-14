'use client'

import { motion } from 'framer-motion';

interface SectionHeadingProps {
    subtitle?: string;
    title: string;
    highlight?: string;
    description?: string;
    align?: 'center' | 'left' | 'right';
    className?: string;
}

export function SectionHeading({
    subtitle,
    title,
    highlight,
    description,
    align = 'center',
    className = ''
}: SectionHeadingProps) {
    const alignClass = {
        center: 'text-center',
        left: 'text-left',
        right: 'text-right'
    }[align];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${alignClass} ${className} mb-12 md:mb-16`}>

            {subtitle && (
                <span className="text-[#D4784A] text-sm font-bold tracking-widest uppercase mb-4 block">
                    {subtitle}
                </span>
            )}

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2018] mb-4">
                {title}
                {highlight && <span className="text-[#2E5D4B]"> {highlight}</span>}
            </h2>

            {description && (
                <p className={`text-gray-600 max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}>
                    {description}
                </p>
            )}
        </motion.div>
    );
}
