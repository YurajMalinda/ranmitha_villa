'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Bed, Users, Maximize, Check } from 'lucide-react';
import { roomsData } from '@/data/rooms';
import { RoomService } from '@/services/frontend/room.service';
import { useBooking } from '@/components/booking/BookingContext';

interface ApiRoom {
    _id: string;
    type: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    images: string[];
    beds: { king: number; queen: number; twin: number };
    size: string;
    amenities: string[];
    bathrooms: number;
    hasAC: boolean;
    status: string;
}

export function RoomsSection() {
    const { openBooking } = useBooking();
    const { title, description } = roomsData;
    const [rooms, setRooms] = useState<ApiRoom[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        RoomService.getAll()
            .then((data) => {
                if (data?.rooms?.length > 0) setRooms(data.rooms);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const bedsLabel = (beds: ApiRoom['beds']) => {
        const parts = [];
        if (beds?.king) parts.push(`${beds.king} King`);
        if (beds?.queen) parts.push(`${beds.queen} Queen`);
        if (beds?.twin) parts.push(`${beds.twin} Twin`);
        return parts.join(' + ') || '—';
    };

    const displayRooms = rooms.map((r, i) => ({
        name: r.type,
        subtitle: r.maxGuests <= 2 ? 'Perfect for Couples' : 'Ideal for Families or Groups',
        price: `LKR ${r.pricePerNight.toLocaleString()}`,
        description: r.description,
        image: r.images?.[0],
        size: r.size ? `${r.size} m²` : '—',
        guests: `${r.maxGuests} Adults`,
        beds: bedsLabel(r.beds),
        featured: i === 0,
        amenities: r.amenities?.slice(0, 5) || [],
        _id: r._id,
    }));

    return (
        <section id="rooms" className="py-20 md:py-28 px-4 md:px-8 bg-white">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16">
                    <span className="text-[#D4784A] text-sm font-bold tracking-widest uppercase mb-4 block">
                        {title.subtitle}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2018] mb-4">
                        {title.main}
                        <span className="text-[#2E5D4B]"> {title.highlight}</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">{description}</p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="bg-[#FBF8F3] rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                <div className="h-64 bg-gray-200" />
                                <div className="p-6 space-y-4">
                                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                    <div className="flex gap-4 pt-2">
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                        <div className="h-4 bg-gray-200 rounded w-20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {displayRooms.map((room, index) => (
                            <motion.div
                                key={room._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.15 }}
                                className={`bg-[#FBF8F3] rounded-2xl overflow-hidden ${room.featured ? 'ring-2 ring-[#D4784A] shadow-lg' : 'shadow-sm'}`}>

                                {room.featured && (
                                    <div className="bg-[#D4784A] text-white text-center py-2 text-sm font-semibold tracking-wide">
                                        Most Popular
                                    </div>
                                )}

                                <div className="relative h-64 overflow-hidden group bg-[#EFF7F3]">
                                    {room.image && (
                                        <Image
                                            src={room.image}
                                            alt={room.name}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                                        <span className="font-bold text-[#2E5D4B]">{room.price}</span>
                                        <span className="text-gray-500 text-sm"> /night</span>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8">
                                    <h3 className="text-2xl font-bold text-[#2A2018] mb-1">{room.name}</h3>
                                    <p className="text-[#D4784A] font-medium mb-5">{room.subtitle}</p>

                                    <div className="flex flex-wrap gap-3 mb-5">
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-sm text-gray-600 shadow-sm">
                                            <Maximize className="w-4 h-4 text-[#2E5D4B]" />
                                            {room.size}
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-sm text-gray-600 shadow-sm">
                                            <Users className="w-4 h-4 text-[#2E5D4B]" />
                                            {room.guests}
                                        </div>
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg text-sm text-gray-600 shadow-sm">
                                            <Bed className="w-4 h-4 text-[#2E5D4B]" />
                                            {room.beds}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm leading-relaxed mb-5">{room.description}</p>

                                    {room.amenities.length > 0 && (
                                        <div className="grid grid-cols-2 gap-2 mb-6">
                                            {room.amenities.map((amenity, aIndex) => (
                                                <div key={aIndex} className="flex items-center gap-2">
                                                    <div className="w-4 h-4 rounded-full bg-[#EFF7F3] flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-2.5 h-2.5 text-[#2E5D4B]" />
                                                    </div>
                                                    <span className="text-xs text-gray-600">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={openBooking}
                                        className="block w-full bg-[#2E5D4B] hover:bg-[#1E4A3A] text-white text-center py-3 rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-[#2E5D4B]/20 active:scale-[0.98]">
                                        Check Availability
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}
