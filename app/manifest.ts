import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Ranmitha Villa Weligama',
        short_name: 'Ranmitha Villa',
        description: 'Family-owned boutique villa 200m from Weligama Beach, Sri Lanka. Rated 9.0 on Booking.com.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2E5D4B',
        orientation: 'portrait',
        categories: ['travel', 'lifestyle'],
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'any',
            },
        ],
    }
}
