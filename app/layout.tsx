import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-lato',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Ranmitha Villa Weligama | Family-Owned Boutique Villa in Sri Lanka',
  description: 'Stay at Ranmitha Villa — a family-owned boutique villa 200m from Weligama Beach. Spacious self-contained villas with full kitchen, fast WiFi, and 9.0 rating on Booking.com. Surfing, whale watching, and Galle Fort nearby.',
  keywords: [
    'Ranmitha Villa',
    'Weligama villa',
    'Weligama beach villa',
    'villa near Weligama Beach',
    'boutique villa Sri Lanka',
    'self-contained villa Weligama',
    'family villa Sri Lanka',
    'Sri Lanka accommodation',
    'villa with kitchen Sri Lanka',
    'surf villa Weligama',
    'Weligama holiday rental',
    'Southern Sri Lanka villa',
    'Pelena Weligama',
    'villa rental Weligama',
    'whale watching Mirissa accommodation',
    'Galle Fort nearby villa',
    'Sri Lanka beach holiday',
    'Weligama surf camp accommodation',
    'villa Booking.com Sri Lanka',
    'remote work villa Sri Lanka',
  ],
  authors: [{ name: 'Ranmitha Villa' }],
  openGraph: {
    title: 'Ranmitha Villa Weligama | Boutique Villa 200m from the Beach',
    description: 'Family-owned villa in Weligama, Sri Lanka. Spacious self-contained units with full kitchen, 200m from the beach. Rated 9.0 on Booking.com.',
    url: 'https://www.ranmithavilla.com',
    siteName: 'Ranmitha Villa',
    images: [
      {
        url: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/af/c5/ab/ranmitha-villa-weligama.jpg?w=1200&h=628&s=1',
        width: 1200,
        height: 628,
        alt: 'Ranmitha Villa Weligama Sri Lanka',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ranmitha Villa Weligama | Boutique Villa in Sri Lanka',
    description: 'Family-owned villa 200m from Weligama Beach. Rated 9.0 on Booking.com.',
    images: ['https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/af/c5/ab/ranmitha-villa-weligama.jpg?w=1200&h=628&s=1'],
  },
  alternates: {
    canonical: 'https://www.ranmithavilla.com',
  },
  other: {
    'geo.region': 'LK-3',
    'geo.placename': 'Weligama, Southern Province, Sri Lanka',
    'geo.position': '5.9738813;80.4347476',
    'ICBM': '5.9738813, 80.4347476',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-LK" className={`${playfair.variable} ${lato.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2E5D4B" />
        {/* Inline script: set dark class before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('admin_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "LodgingBusiness",
                "name": "Ranmitha Villa",
                "description": "Family-owned boutique villa 200m from Weligama Beach, Sri Lanka. Spacious self-contained units with full kitchen, fast WiFi, and warm Sri Lankan hospitality.",
                "url": "https://www.ranmithavilla.com",
                "telephone": "+94718116780",
                "email": "ranmithavilla@gmail.com",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "No. 550, Pelena",
                  "addressLocality": "Weligama",
                  "addressRegion": "Southern Province",
                  "postalCode": "81700",
                  "addressCountry": "LK"
                },
                "geo": {
                  "@type": "GeoCoordinates",
                  "latitude": 5.9738813,
                  "longitude": 80.4347476
                },
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "9.0",
                  "bestRating": "10",
                  "worstRating": "1",
                  "ratingCount": "50",
                  "reviewAspect": "Booking.com"
                },
                "priceRange": "$$",
                "amenityFeature": [
                  { "@type": "LocationFeatureSpecification", "name": "Free WiFi", "value": true },
                  { "@type": "LocationFeatureSpecification", "name": "Air conditioning", "value": true },
                  { "@type": "LocationFeatureSpecification", "name": "Kitchen", "value": true },
                  { "@type": "LocationFeatureSpecification", "name": "Free parking", "value": true }
                ],
                "image": "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/af/c5/ab/ranmitha-villa-weligama.jpg?w=1200&h=628&s=1",
                "sameAs": [
                  "https://www.facebook.com/ranmithavilla/",
                  "https://www.instagram.com/ranmithavilla/"
                ]
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Ranmitha Villa",
                "url": "https://www.ranmithavilla.com",
                "logo": "https://www.ranmithavilla.com/icon.svg",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "telephone": "+94718116780",
                  "contactType": "reservations",
                  "availableLanguage": ["English", "Sinhala"]
                },
                "sameAs": [
                  "https://www.facebook.com/ranmithavilla/",
                  "https://www.instagram.com/ranmithavilla/"
                ]
              }
            ])
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  )
}
