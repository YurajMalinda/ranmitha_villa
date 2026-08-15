'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
    {
        question: "What are the check-in and check-out times?",
        answer: "Check-in is from 11:00 AM to 11:00 PM. Check-out is by 10:00 AM. Early check-in or late check-out may be available upon request, subject to availability."
    },
    {
        question: "Is breakfast included in the stay?",
        answer: "Continental breakfast is available daily from 7:00 AM to 10:00 AM for an additional fee. Each villa has a fully equipped kitchen so you're welcome to prepare your own meals anytime."
    },
    {
        question: "Do you offer airport transfers?",
        answer: "Yes, we can arrange paid airport transfers from Koggala Airport (19 min drive) or Colombo International Airport. Please contact us in advance to arrange this service."
    },
    {
        question: "Is the villa suitable for families with children?",
        answer: "Absolutely! Ranmitha Villa is family-friendly. We offer children's activities and babysitting services (extra charge). Our spacious villas are comfortable for families of up to 4 guests."
    },
    {
        question: "What is your cancellation policy?",
        answer: "Cancellation policies vary by booking platform. Please check the policy on your booking confirmation. For direct bookings, contact us and we will do our best to accommodate your needs."
    },
    {
        question: "Is WiFi available at the villa?",
        answer: "Yes, we offer fast fiber optic WiFi (25+ Mbps) throughout the property — perfect for remote workers and digital nomads."
    },
    {
        question: "What activities are available nearby?",
        answer: "Weligama is a world-famous surf destination. We can arrange surf lessons, snorkeling, diving, whale watching in Mirissa, cycling, and day trips to Galle Fort and Taprobane Island."
    }
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer,
            },
        })),
    };

    return (
        <section className="py-20 bg-[#F9F9F9]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <span className="text-[#2E5D4B] uppercase tracking-widest text-sm font-semibold">Common Questions</span>
                    <h2 className="text-3xl md:text-4xl font-serif text-[#2A2018] mt-3">Good to Know</h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-sm"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className={`text-lg font-medium ${openIndex === index ? 'text-[#2E5D4B]' : 'text-[#2A2018]'}`}>
                                    {faq.question}
                                </span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-[#2E5D4B]" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                    >
                                        <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
