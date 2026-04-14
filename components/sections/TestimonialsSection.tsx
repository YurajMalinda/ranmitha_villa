'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star, ExternalLink, Award } from 'lucide-react';
import { testimonialsData } from '@/data/testimonials';
import { TestimonialService } from '@/services/frontend/testimonial.service';

interface ApiTestimonial {
    _id: string;
    author: string;
    quote: string;
    rating: number;
    source: string;
}

export function TestimonialsSection() {
    const { heading, ratings, superhost, cta } = testimonialsData;
    const [testimonials, setTestimonials] = useState<ApiTestimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        TestimonialService.list().then((res) => {
            if (res.success) setTestimonials(res.testimonials || []);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    return (
        <section id="reviews" className="py-20 md:py-28 px-4 md:px-8 bg-[#FBF8F3]">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16">

                    <span className="text-[#D4784A] text-sm font-bold tracking-widest uppercase mb-4 block">
                        {heading.subtitle}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2018] mb-4">
                        {heading.title} <span className="text-[#2E5D4B]">{heading.highlight}</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto mb-8">{heading.description}</p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {ratings.map((rating: any, index: number) =>
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-sm ${rating.isAward ? 'ring-2 ring-[#FF5A5F]/30' : ''}`}>
                                {rating.isAward ? (
                                    <>
                                        <Award className="w-5 h-5" style={{ color: rating.color }} />
                                        <span className="font-bold" style={{ color: rating.color }}>{rating.score}</span>
                                    </>
                                ) : (
                                    <div className="text-white font-bold px-2.5 py-1 rounded text-sm" style={{ backgroundColor: rating.color }}>
                                        {rating.score}
                                    </div>
                                )}
                                <span className="text-gray-700 font-medium text-sm">{rating.platform}</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-[#FF5A5F]/10 to-[#FF5A5F]/5 rounded-2xl p-6 md:p-8 mb-12 border border-[#FF5A5F]/20">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-20 h-20 bg-[#FF5A5F] rounded-full flex items-center justify-center shrink-0">
                            <Award className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#2A2018] mb-2">{superhost.title}</h3>
                            <p className="text-gray-600">{superhost.description}</p>
                        </div>
                    </div>
                </motion.div>

                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-8 shadow-sm space-y-4 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-24" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-200 rounded" />
                                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                                    <div className="h-3 bg-gray-200 rounded w-4/6" />
                                </div>
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="h-4 bg-gray-200 rounded w-28" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && testimonials.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) =>
                            <motion.div
                                key={testimonial._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className="bg-white rounded-2xl p-8 shadow-sm relative">
                                <Quote className="w-10 h-10 text-[#D4784A]/20 absolute top-6 right-6" />
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(5)].map((_, i) =>
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.round(testimonial.rating) ? 'text-[#D4784A]' : 'text-gray-200'}`}
                                            fill={i < Math.round(testimonial.rating) ? '#D4784A' : '#e5e7eb'}
                                        />
                                    )}
                                    <span className="ml-2 text-sm font-bold text-[#2E5D4B]">
                                        {Number(testimonial.rating).toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-gray-600 leading-relaxed mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="font-semibold text-[#2A2018]">{testimonial.author}</p>
                                        <p className="text-sm text-gray-500">{testimonial.source}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12 flex flex-wrap justify-center gap-4">
                    <a
                        href={cta.booking.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#2A2018] px-6 py-3 rounded-full shadow-sm transition-colors font-medium">
                        {cta.booking.label}
                        <ExternalLink className="w-4 h-4" />
                    </a>
                    <a
                        href={cta.facebook.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-6 py-3 rounded-full shadow-sm transition-colors font-medium">
                        {cta.facebook.label}
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>
        </section>
    );
}
