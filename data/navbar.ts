import { NavbarData } from '@/types';

export const navbarData: NavbarData = {
    logoText: "Ranmitha Villa",
    links: [
        { name: 'Home', href: '#home' },
        { name: 'Villas', href: '#rooms' },
        { name: 'Gallery', href: '#gallery' },
        { name: 'Tours', href: '#experiences' },
        { name: 'Location', href: '#location' },
        { name: 'Reviews', href: '#reviews' }
    ],
    contact: {
        whatsapp: {
            number: "+94 71 811 6780",
            label: "WhatsApp",
            href: "https://wa.me/94718116780"
        },
        phone: {
            number: "+94 77 860 9856",
            label: "Call Now",
            href: "tel:+94718116780"
        }
    }
};
