'use client'

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { welcomeData } from '@/data/welcome';

export function WelcomeSection() {
  const { images, heading, content, stats } = welcomeData;
  const { main, badge } = images;

  return (
    <section className="py-20 md:py-28 px-4 md:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative">

            <div className="absolute -top-4 -left-4 w-full h-full bg-[#2E5D4B]/10 rounded-2xl" />
            <div className="relative overflow-hidden rounded-2xl shadow-xl aspect-[4/3]">
              <Image
                src={main.src}
                alt={main.alt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover" />

            </div>
            {/* Airbnb Superhost Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-5">

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF5A5F] rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold text-[#2A2018]">{badge.text}</p>
                  <p className="text-sm text-[#FF5A5F] font-medium">
                    Since {badge.year}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}>

            <span className="text-[#D4784A] text-sm font-bold tracking-widest uppercase mb-4 block">
              {heading.subtitle}
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2A2018] mb-6 leading-tight">
              {heading.title} <span className="text-[#2E5D4B]">{heading.highlight}</span>
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              {content.paragraphs.map((paragraph: string, index: number) => (
                <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat: any, index: number) => (
                <div key={index} className="text-center p-4 rounded-xl bg-[#FBF8F3]">
                  <p className="text-xl font-bold text-[#2E5D4B]">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
