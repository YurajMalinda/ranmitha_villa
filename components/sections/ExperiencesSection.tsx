'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Check, X } from 'lucide-react';
import { TourService } from '@/services/frontend/tour.service';
import { experiencesData } from '@/data/experiences';

interface Tour {
  title: string;
  images: string[];
  price: string;
  duration: string;
  description: string;
  features: string[];
}

export function ExperiencesSection() {
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const { heading } = experiencesData;

  useEffect(() => {
    TourService.listTours().then((response) => {
      if (response.success && response.tours.length > 0) {
        setTours(response.tours.map((t: any) => ({
          title: t.name,
          images: t.images && t.images.length > 0 ? t.images : [],
          price: t.price || 'Contact for Price',
          duration: t.duration || 'Flexible',
          description: t.description,
          features: t.features || [],
        })));
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <section id="experiences" className="py-20 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12">
          <span className="text-[#D4784A] text-sm font-bold tracking-widest uppercase mb-4 block">
            {heading.subtitle}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2018] mb-4">
            {heading.title} <span className="text-[#2E5D4B]">{heading.highlight}</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{heading.description}</p>
        </motion.div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#FBF8F3] rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tours.length === 0 ? null : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tours.map((tour, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#FBF8F3] rounded-2xl overflow-hidden group cursor-pointer"
                onClick={() => setSelectedTour(tour)}>

                <div className="h-48 overflow-hidden relative bg-[#EFF7F3]">
                  {tour.images[0] && (
                    <Image
                      src={tour.images[0]}
                      alt={tour.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#2E5D4B]">
                    {tour.price}
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {tour.duration}
                  </div>
                  <h3 className="font-bold text-[#2A2018] mb-2 group-hover:text-[#2E5D4B] transition-colors">{tour.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{tour.description}</p>
                  <button className="text-[#D4784A] text-sm font-semibold hover:underline">View Details</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTour(null)}>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
              onClick={e => e.stopPropagation()}>

              <button
                onClick={() => setSelectedTour(null)}
                className="sticky top-4 right-4 ml-auto -mb-10 mr-4 z-50 bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-all hover:scale-105 flex items-center justify-center w-10 h-10 backdrop-blur-md"
              >
                <X className="w-5 h-5 text-gray-800" />
              </button>

              {selectedTour.images.length > 0 && (
                <div className="relative h-64 md:h-96 bg-gray-100 overflow-x-auto snap-x snap-mandatory flex custom-scrollbar">
                  {selectedTour.images.map((img, idx) => (
                    <div key={idx} className="relative h-full flex-shrink-0 snap-center" style={{ minWidth: '100%' }}>
                      <Image
                        src={img}
                        alt={`${selectedTour.title} ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                  {selectedTour.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {selectedTour.images.map((_, idx) => (
                        <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/50 backdrop-blur-sm shadow-sm" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#2A2018] mb-1">{selectedTour.title}</h3>
                    <p className="text-gray-500">{selectedTour.duration}</p>
                  </div>
                  <div className="bg-[#EFF7F3] px-4 py-2 rounded-lg text-[#2E5D4B] font-bold">
                    {selectedTour.price}
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-8">{selectedTour.description}</p>

                {selectedTour.features.length > 0 && (
                  <>
                    <h4 className="font-bold text-[#2A2018] mb-4">What&apos;s Included:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {selectedTour.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-5 h-5 rounded-full bg-[#EFF7F3] flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-[#2E5D4B]" />
                          </div>
                          {feature}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <a
                  href={`https://wa.me/94777222888?text=Hi, I'm interested in the ${selectedTour.title}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#25D366] text-white text-center py-4 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors">
                  Book on WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
