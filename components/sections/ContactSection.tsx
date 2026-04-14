'use client'

import { MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ContactSection() {
    return (
        <section className="py-20 bg-white" id="contact">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Contact Details */}
                    <div className="space-y-8">
                        <div>
                            <span className="text-[#2E5D4B] uppercase tracking-widest text-sm font-semibold">Get in Touch</span>
                            <h2 className="text-3xl md:text-4xl font-serif text-[#2A2018] mt-3 mb-6">We&apos;re Here for You</h2>
                            <p className="text-gray-600 leading-relaxed">
                                Whether you have questions about your upcoming stay, need help with directions, or want to plan a special event, our team is ready to assist.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#EFF7F3] rounded-full text-[#2E5D4B] mt-1">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2A2018] mb-1">Visit Us</h4>
                                    <p className="text-gray-600">550, Galle Road, Pelena<br />81700 Weligama, Sri Lanka</p>
                                    <a
                                        href="https://maps.app.goo.gl/tMdMzfeQiZa9jjVD6"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-[#2E5D4B] font-medium hover:underline mt-1 inline-block"
                                    >
                                        Get Directions &rarr;
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#EFF7F3] rounded-full text-[#2E5D4B] mt-1">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2A2018] mb-1">Call Us</h4>
                                    <p className="text-gray-600">+94 71 811 6780</p>
                                    <p className="text-gray-600">+94 77 860 9856</p>
                                    <p className="text-sm text-gray-500 mt-1">Available 8am - 10pm daily</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-[#EFF7F3] rounded-full text-[#2E5D4B] mt-1">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#2A2018] mb-1">Email Us</h4>
                                    <p className="text-gray-600">ranmithavilla@gmail.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={() => window.open('https://wa.me/94718116780', '_blank')}
                                className="w-full sm:w-auto"
                            >
                                Chat on WhatsApp
                            </Button>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="bg-gray-100 rounded-2xl overflow-hidden h-[400px] lg:h-[500px] shadow-lg relative group">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966!2d80.4347476!3d5.9738813!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae1154870b58f99%3A0x2cebc6a51cc9dd6e!2sRanmitha%20Villa%20Weligama!5e0!3m2!1sen!2slk!4v1715000000000!5m2!1sen!2slk"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale group-hover:grayscale-0 transition-all duration-700"
                        ></iframe>

                        <div className="absolute inset-0 bg-[#2E5D4B]/10 pointer-events-none group-hover:bg-transparent transition-colors duration-700"></div>
                    </div>

                </div>
            </div>
        </section>
    );
}
