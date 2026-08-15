'use client'

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { MapPin, ChevronDown } from 'lucide-react';
import { heroData } from '@/data/hero';

export function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const { content, images } = heroData;
  const { title, description, stats, cta, badge } = content;
  const { background } = images;

  return (
    <div
      ref={ref}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">

      {/* Parallax Background */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0">

        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60 z-10" />
        <Image
          src={background}
          alt="Ranmitha Villa Weligama Sri Lanka"
          fill
          priority
          sizes="100vw"
          className="object-cover" />

      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 text-center px-4 max-w-5xl mx-auto pt-20">

        {/* Location Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 mb-6">

          <MapPin className="w-4 h-4 text-[#D4784A]" />
          <span className="text-white/90 text-sm font-medium">
            {badge}
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">

          {title.line1}
          <br />
          {title.line2}
          <br />
          <span className="text-[#D4784A] italic font-light">{title.highlight}</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
          {description}
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4 mb-10">

          {stats.map((stat: any, index: number) => (
            <div key={index} className="flex flex-col items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <span className="text-xl font-bold text-white">{stat.value}</span>
              <span className="text-xs text-white/80 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center">

          <a
            href={cta.primary.href}
            className="inline-flex items-center gap-2 bg-[#D4784A] hover:bg-[#B85F30] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">

            {cta.primary.label}
          </a>
          <a
            href={cta.secondary.href}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 border border-white/30">

            {cta.secondary.label}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator — hidden on small screens, where the stacked CTAs grow
          past the viewport and would collide with it. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 z-20">

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-white/70">

          <span className="text-xs uppercase tracking-widest">
            Scroll to explore
          </span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </div>
  );
}
