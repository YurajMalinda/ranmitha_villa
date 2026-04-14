'use client'

import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
    href?: string;
    external?: boolean;
}

export function Button({
    variant = 'primary',
    size = 'md',
    icon,
    iconPosition = 'right',
    href,
    external,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary: 'bg-[#2E5D4B] hover:bg-[#1E4A3A] text-white focus:ring-[#2E5D4B]',
        secondary: 'bg-[#D4784A] hover:bg-[#B85F30] text-white focus:ring-[#D4784A]',
        outline: 'border-2 border-[#2E5D4B] text-[#2E5D4B] hover:bg-[#2E5D4B] hover:text-white focus:ring-[#2E5D4B]',
        ghost: 'text-[#2E5D4B] hover:bg-[#EFF7F3] focus:ring-[#2E5D4B]'
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg'
    };

    const content = (
        <>
            {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        </>
    );

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

    if (href) {
        return (
            <motion.a
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className={classes}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                {...(props as unknown as HTMLMotionProps<'a'>)}>
                {content}
            </motion.a>
        );
    }

    return (
        <motion.button
            className={classes}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            {...props}>
            {content}
        </motion.button>
    );
}
