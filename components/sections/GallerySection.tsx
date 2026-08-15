'use client'

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { galleryData } from '@/data/gallery';
import { GalleryService } from '@/services/frontend/gallery.service';

interface GalleryImage {
    _id: string;
    src: string;
    alt: string;
    title: string;
    description?: string;
}

export function GallerySection() {
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [images, setImages] = useState<GalleryImage[]>([]);

    const { heading, cta } = galleryData;

    useEffect(() => {
        GalleryService.list().then((res) => {
            if (res.success) setImages(res.images || []);
        });
    }, []);

    const currentIndex = selectedImage
        ? images.findIndex(img => img._id === selectedImage._id)
        : -1;

    const goToPrevious = useCallback(() => {
        setSelectedImage((current) => {
            const i = current ? images.findIndex(img => img._id === current._id) : -1;
            return i > 0 ? images[i - 1] : current;
        });
    }, [images]);

    const goToNext = useCallback(() => {
        setSelectedImage((current) => {
            const i = current ? images.findIndex(img => img._id === current._id) : -1;
            return i > -1 && i < images.length - 1 ? images[i + 1] : current;
        });
    }, [images]);

    // Lightbox: lock body scroll, and wire Escape / arrow keys.
    useEffect(() => {
        if (!selectedImage) return;

        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedImage(null);
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', onKey);

        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [selectedImage, goToPrevious, goToNext]);

    return (
        <section id="gallery" className="py-20 md:py-28 px-4 md:px-8 bg-[#FBF8F3]">
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
                        {heading.title}{' '}
                        <span className="text-[#2E5D4B]">{heading.highlight}</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">{heading.description}</p>
                </motion.div>

                {images.length === 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className={`rounded-xl bg-gray-200 animate-pulse ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`} style={{ aspectRatio: '1' }} />
                        ))}
                    </div>
                )}

                {images.length > 0 && (
                    <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <AnimatePresence mode="popLayout">
                            {images.map((image, index) =>
                                <motion.div
                                    key={image._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={`relative overflow-hidden rounded-xl cursor-pointer group ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
                                    onClick={() => setSelectedImage(image)}>

                                    <div className={`relative aspect-square ${index === 0 ? 'md:aspect-auto md:h-full' : ''}`}>
                                        <Image src={image.src} alt={image.alt} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="absolute bottom-0 left-0 right-0 p-4">
                                            <h3 className="text-white font-semibold text-sm md:text-base">{image.title}</h3>
                                            {image.description && <p className="text-white/80 text-xs md:text-sm mt-1 line-clamp-2">{image.description}</p>}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-10">
                    <a
                        href={cta.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#2A2018] px-6 py-3 rounded-full shadow-sm transition-colors font-medium border border-gray-200">
                        <Camera className="w-4 h-4" />
                        {cta.label}
                    </a>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedImage &&
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label={selectedImage.title}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}>

                        <button onClick={() => setSelectedImage(null)} aria-label="Close gallery" className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-10">
                            <X className="w-8 h-8" />
                        </button>

                        {currentIndex > 0 &&
                            <button onClick={(e) => { e.stopPropagation(); goToPrevious(); }} aria-label="Previous image" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full backdrop-blur-sm z-10">
                                <ChevronLeft className="w-8 h-8" />
                            </button>
                        }
                        {currentIndex < images.length - 1 &&
                            <button onClick={(e) => { e.stopPropagation(); goToNext(); }} aria-label="Next image" className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 bg-white/10 rounded-full backdrop-blur-sm z-10">
                                <ChevronRight className="w-8 h-8" />
                            </button>
                        }

                        <motion.div
                            key={selectedImage._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="max-w-5xl max-h-[80vh] relative"
                            onClick={(e) => e.stopPropagation()}>

                            <Image
                                src={selectedImage.src}
                                alt={selectedImage.alt}
                                width={1600}
                                height={1200}
                                sizes="(max-width: 1024px) 100vw, 1024px"
                                className="w-auto max-w-full max-h-[70vh] object-contain rounded-lg" />

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                                <h3 className="text-white font-bold text-xl">{selectedImage.title}</h3>
                                {selectedImage.description && <p className="text-white/80 mt-1">{selectedImage.description}</p>}
                                <p className="text-white/60 text-sm mt-2">
                                    {currentIndex + 1} / {images.length}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                }
            </AnimatePresence>
        </section>
    );
}
