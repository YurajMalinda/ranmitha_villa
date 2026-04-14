import {
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

// Custom SVG icons for social networks not available in lucide-react
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
import { footerData } from '@/data/footer';

export function Footer() {
  const { cta, contactBox, main } = footerData;

  return (
    <footer className="bg-[#2A2018] text-white">
      {/* Contact Section */}
      <div className="py-16 px-4 md:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {cta.title}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {cta.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {/* WhatsApp */}
            <a
              href={contactBox.whatsapp.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">

              <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-1">WhatsApp</h3>
              <p className="text-gray-400 text-sm">{contactBox.whatsapp.number}</p>
            </a>

            {/* Phone */}
            <a
              href={contactBox.phone.href}
              className="flex flex-col items-center p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">

              <div className="w-14 h-14 bg-[#2E5D4B] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Call Us</h3>
              <p className="text-gray-400 text-sm">{contactBox.phone.number}</p>
            </a>

            {/* Email */}
            <a
              href={contactBox.email.href}
              className="flex flex-col items-center p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">

              <div className="w-14 h-14 bg-[#D4784A] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Email Us</h3>
              <p className="text-gray-400 text-sm text-center">
                {contactBox.email.address}
              </p>
            </a>

            {/* Booking.com */}
            <a
              href={contactBox.booking.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors group">

              <div className="w-14 h-14 bg-[#003580] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ExternalLink className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Booking.com</h3>
              <p className="text-gray-400 text-sm">{contactBox.booking.label}</p>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-serif font-bold mb-4">
                {main.brand.name}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
                {main.brand.description}
              </p>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-gray-400">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-[#D4784A]" />
                  <div>
                    <p>550, Galle Road</p>
                    <p>Pelena, 81700 Weligama, Sri Lanka</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Phone className="w-5 h-5 shrink-0 text-[#D4784A]" />
                  <div>
                    {main.phones.map((phone, idx) => (
                      <p key={idx}>{phone}</p>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 shrink-0 text-[#D4784A]" />
                  <p>{main.email}</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a
                  href={main.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition-colors">

                  <FacebookIcon className="w-5 h-5" />
                </a>
                <a
                  href={main.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E4405F] transition-colors">

                  <InstagramIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-[#D4784A]">Quick Links</h4>
              <ul className="space-y-3">
                {main.quickLinks.map((link) =>
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm">

                      {link.name}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h4 className="font-semibold mb-4 text-[#D4784A]">Information</h4>
              <ul className="space-y-3">
                {main.policies.map((link) =>
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm">

                      {link.name}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            {main.copyright}
          </p>
          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <span>{main.tagline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
