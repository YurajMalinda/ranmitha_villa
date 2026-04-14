export interface NavLink {
    name: string;
    href: string;
}

export interface SocialLink {
    platform: string;
    href: string;
    icon: string; // We'll store the icon name as a string and look it up, or generic
}

export interface NavbarData {
    logoText: string;
    links: NavLink[];
    contact: {
        whatsapp: {
            number: string;
            label: string;
            href: string;
        };
        phone: {
            number: string;
            label: string;
            href: string;
        };
    };
}

export interface HeroSectionData {
    locationBadge: string;
    title: {
        line1: string;
        highlight: string;
    };
    subtitle: string;
    ratings: {
        booking: string;
        trip: string;
        airbnb: string;
    };
    backgroundImage: string;
    cta: {
        primary: {
            label: string;
            href: string;
        };
        secondary: {
            label: string;
            href: string;
        };
    };
}

export interface Amenity {
    name: string;
    icon?: string;
    description?: string;
}

export interface Room {
    name: string;
    subtitle: string;
    image: string;
    size: string;
    guests: string;
    beds: string;
    price: string;
    description: string;
    amenities: string[];
    featured?: boolean;
}

export interface SeasonalRate {
    season: string;
    dates: string;
    standardPrice: string;
    familyPrice: string;
}

export interface RoomsSectionData {
    title: {
        subtitle: string;
        main: string;
        highlight: string;
    };
    description: string;
    rooms: Room[];
    rates: {
        title: string;
        columns: string[];
        seasons: SeasonalRate[];
        note: string;
    };
}

export interface FooterLink {
    name: string;
    href: string;
}

export interface FooterData {
    cta: {
        title: string;
        description: string;
    };
    contactBox: {
        whatsapp: {
            number: string;
            href: string;
        };
        phone: {
            number: string;
            href: string;
        };
        email: {
            address: string;
            href: string;
        };
        booking: {
            label: string;
            href: string;
        };
    };
    main: {
        brand: {
            name: string;
            description: string;
        };
        address: {
            line1: string;
            line2: string;
        };
        phones: string[];
        email: string;
        socials: {
            facebook: string;
            instagram: string;
        };
        quickLinks: FooterLink[];
        policies: FooterLink[];
        copyright: string;
        tagline: string;
    };
}
