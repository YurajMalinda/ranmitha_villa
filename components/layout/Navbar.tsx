'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle, Calendar } from 'lucide-react';
import { navbarData } from '@/data/navbar';
import { useBooking } from '@/components/booking/BookingContext';

export function Navbar() {
  const { openBooking } = useBooking();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { logoText, links, contact } = navbarData;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg py-3' : 'bg-transparent py-5'}`}>

        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <span
              className={`text-xl md:text-2xl font-serif font-bold transition-colors ${isScrolled ? 'text-[#2E5D4B]' : 'text-white'}`}>
              {logoText}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map((link) =>
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group ${isScrolled ? 'text-gray-700 hover:text-[#2E5D4B]' : 'text-white/90 hover:text-white'}`}>

                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-[#2E5D4B]' : 'bg-[#D4784A]'}`} />

              </a>
            )}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* WhatsApp (Secondary) */}
            <a
              href={contact.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${isScrolled ? 'text-[#25D366] hover:bg-green-50' : 'text-white/80 hover:text-white'}`}>
              <MessageCircle className="w-4 h-4" />
              {contact.whatsapp.label}
            </a>

            {/* Book Now (Primary) */}
            <button
              onClick={openBooking}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg transform hover:-translate-y-0.5 ${isScrolled ? 'bg-[#2E5D4B] text-white hover:bg-[#1E4A3A]' : 'bg-[#D4784A] text-white hover:bg-[#B85F30]'}`}>
              <Calendar className="w-4 h-4" />
              Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 transition-colors ${isScrolled ? 'text-[#2E5D4B]' : 'text-white'}`}
            aria-label="Toggle menu">

            {isMobileMenuOpen ?
              <X className="w-6 h-6" /> :

              <Menu className="w-6 h-6" />
            }
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen &&
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden">

              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <span className="font-serif font-bold text-[#2E5D4B]">
                    {logoText}
                  </span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 text-gray-500">

                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 py-4">
                  {links.map((link, index) =>
                    <motion.a
                      key={link.name}
                      href={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-6 py-3 text-gray-700 hover:bg-[#EFF7F3] hover:text-[#2E5D4B] transition-colors font-medium">

                      {link.name}
                    </motion.a>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 space-y-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openBooking();
                    }}
                    className="flex items-center justify-center gap-2 w-full bg-[#2E5D4B] text-white py-3 rounded-lg font-bold shadow-lg">
                    <Calendar className="w-4 h-4" />
                    Book Your Stay
                  </button>

                  <a
                    href={contact.whatsapp.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-3 rounded-lg font-medium">

                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        }
      </AnimatePresence>
    </>
  );
}
