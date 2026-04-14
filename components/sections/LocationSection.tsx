'use client'

import Image from 'next/image';
import { motion } from 'framer-motion';
import { MapPin, Waves, Train, Car, Plane, Clock, Store } from 'lucide-react';
import { locationData } from '@/data/location';

const iconMap: Record<string, React.ElementType> = {
  Waves,
  Train,
  MapPin,
  Car,
  Plane,
  Clock,
  Store
};

export function LocationSection() {
  const { heading, address, distances, attractions } = locationData;

  return (
    <section id="location" className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>

            <span className="text-[#D4784A] text-sm font-bold tracking-widest uppercase mb-4 block">
              {heading.subtitle}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2018] mb-6">
              {heading.title} <span className="text-[#2E5D4B]">{heading.highlight}</span>
            </h2>

            <p className="text-gray-600 leading-relaxed mb-8">
              {heading.description}
            </p>

            {/* Address */}
            <div className="bg-[#FBF8F3] rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#2E5D4B] rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2A2018] mb-1">{address.title}</h3>
                  <p className="text-gray-600">
                    {address.line1}
                    <br />
                    {address.line2}
                  </p>
                  <a
                    href={address.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2E5D4B] hover:text-[#D4784A] text-sm font-medium mt-2 inline-block">

                    {address.directionsLabel}
                  </a>
                </div>
              </div>
            </div>

            {/* Distances Grid */}
            <div className="grid grid-cols-2 gap-4">
              {distances.map((item: any, index: number) => {
                const Icon = iconMap[item.icon];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-[#FBF8F3] rounded-lg">

                    <Icon className="w-5 h-5 text-[#2E5D4B]" />
                    <div>
                      <p className="text-sm font-medium text-[#2A2018]">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Image & Attractions Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}>

            <div className="relative rounded-2xl overflow-hidden shadow-xl mb-8 h-[300px]">
              <Image
                src={attractions.image.src}
                alt={attractions.image.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {attractions.image.title}
                </h3>
                <p className="text-white/80 text-sm">
                  {attractions.image.description}
                </p>
              </div>
            </div>

            {/* Nearby Attractions */}
            <div className="bg-[#EFF7F3] rounded-2xl p-6">
              <h3 className="font-bold text-[#2A2018] mb-4">
                {attractions.nearbyTitle}
              </h3>
              <ul className="space-y-3">
                {attractions.list.map((attraction: string, index: number) =>
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4784A]" />
                    <span className="text-gray-600 text-sm">{attraction}</span>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
