import { MotionProvider } from '@/components/providers/MotionProvider';
import { BookingProvider } from '@/components/booking/BookingContext';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/sections/HeroSection';
import { WelcomeSection } from '@/components/sections/WelcomeSection';
import { RoomsSection } from '@/components/sections/RoomsSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { ExperiencesSection } from '@/components/sections/ExperiencesSection';
import { LocationSection } from '@/components/sections/LocationSection';
import { AmenitiesGrid } from '@/components/sections/AmenitiesGrid';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { FAQSection } from '@/components/sections/FAQSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export default function HomePage() {
  return (
    <MotionProvider>
      <BookingProvider>
        <div className="min-h-screen bg-white">
          <Navbar />

          <main>
            <section id="home">
              <HeroSection />
            </section>

            <WelcomeSection />

            <RoomsSection />

            <GallerySection />

            <ExperiencesSection />

            <LocationSection />

            <AmenitiesGrid />

            <TestimonialsSection />

            <FAQSection />

            <ContactSection />
          </main>

          <Footer />

          <WhatsAppButton />
          <ScrollToTop />
        </div>
      </BookingProvider>
    </MotionProvider>
  );
}
