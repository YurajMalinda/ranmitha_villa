import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ranmitha Villa Weligama | Family-Owned Boutique Villa in Sri Lanka',
  description: 'Stay at Ranmitha Villa — a family-owned boutique villa 200m from Weligama Beach. Spacious self-contained villas with full kitchen, fast WiFi, and 9.0 rating on Booking.com. Surfing, whale watching, and Galle Fort nearby.',
  keywords: 'Ranmitha Villa, Weligama villa, Sri Lanka accommodation, Weligama Beach, boutique villa Sri Lanka, family villa Weligama, Pelena Weligama',
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#2E5D4B" />
        {/* Inline script: set dark class before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('admin_theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}` }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            })
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  )
}
