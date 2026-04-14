'use client'

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Wind, Droplets, Wifi, UtensilsCrossed, Bed, Car, Clock, Sparkle,
    Briefcase, ShowerHead, Coffee, Shirt, VolumeX, Flower, Bike, Waves,
    Check, Tv, Umbrella, Utensils, Bath, Sun, Globe, Phone, Star, Music,
    Package, Heart, Shield, Zap
} from 'lucide-react';
import { amenitiesData } from '@/data/amenities';
import { AmenityService } from '@/services/frontend/amenity.service';

const iconMap: Record<string, React.ElementType> = {
    Wind, Droplets, Wifi, UtensilsCrossed, Bed, Car, Clock, Sparkle,
    Briefcase, ShowerHead, Coffee, Shirt, VolumeX, Flower, Bike, Waves,
    Check, Tv, Umbrella, Utensils, Bath, Sun, Globe, Phone, Star, Music,
    Package, Heart, Shield, Zap
};

interface ApiAmenity {
    _id: string;
    label: string;
    description: string;
    icon: string;
    category: 'room' | 'property';
    order: number;
}

export function AmenitiesGrid() {
    const { heading } = amenitiesData;
    const [roomItems, setRoomItems] = useState<ApiAmenity[]>([]);
    const [propertyItems, setPropertyItems] = useState<ApiAmenity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AmenityService.list().then((res) => {
            if (res.success && res.amenities) {
                setRoomItems(res.amenities.filter((a: ApiAmenity) => a.category === 'room'));
                setPropertyItems(res.amenities.filter((a: ApiAmenity) => a.category === 'property'));
            }
        }).finally(() => setLoading(false));
    }, []);

    return (
        <section id="amenities" className="py-20 md:py-28 px-4 md:px-8 bg-white">
            <div className="max-w-6xl mx-auto">
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
                    <p className="text-gray-600 max-w-2xl mx-auto">{heading.description}</p>
                </motion.div>

                {loading && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 animate-pulse">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="flex flex-col items-center p-5 rounded-xl bg-[#FBF8F3]">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl mb-3" />
                                <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                                <div className="h-2 bg-gray-200 rounded w-16" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && roomItems.length > 0 && (
                    <div className="mb-12">
                        <h3 className="text-lg font-bold text-[#2A2018] mb-6 text-center">In Your Private Villa</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {roomItems.map((item, index) => {
                                const Icon = iconMap[item.icon] || Check;
                                return (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex flex-col items-center p-5 rounded-xl bg-[#FBF8F3] text-center">
                                        <div className="w-12 h-12 bg-[#EFF7F3] rounded-xl flex items-center justify-center mb-3">
                                            <Icon className="w-6 h-6 text-[#2E5D4B]" />
                                        </div>
                                        <span className="font-medium text-[#2A2018] text-sm mb-1">{item.label}</span>
                                        <span className="text-xs text-gray-500">{item.description}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {propertyItems.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-[#2A2018] mb-6 text-center">Property & Services</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {propertyItems.map((item, index) => {
                                const Icon = iconMap[item.icon] || Check;
                                return (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex flex-col items-center p-5 rounded-xl bg-[#2E5D4B]/5 text-center">
                                        <div className="w-12 h-12 bg-[#2E5D4B] rounded-xl flex items-center justify-center mb-3">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="font-medium text-[#2A2018] text-sm mb-1">{item.label}</span>
                                        <span className="text-xs text-gray-500">{item.description}</span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
