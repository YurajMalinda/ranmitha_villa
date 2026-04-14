export interface Room {
    _id: string;
    type: 'Standard Villa' | 'Family Villa';
    pricePerNight: number;
    maxGuests: number;
    description: string;
    images: string[];
}

export interface BookingPayload {
    roomId: string; // The MongoDB ID
    check_in_date: string; // YYYY-MM-DD
    check_out_date: string; // YYYY-MM-DD
    guests: number;
}

export interface ConfirmationPayload {
    bookingId?: string;
    roomId: string;
    check_in_date: string;
    check_out_date: string;
    guests: number;
    firstname: string;
    lastname: string;
    email: string;
    mobile: string;
    country: string;
    urlHash: string; // "booking"
}

export interface Tour {
    _id: string;
    name: string;
    description: string;
    price: string;
    duration: string;
    images: string[]; // Backend returns images array
    features: string[]; // Might need to be parsed if stored as string
}

export interface BlockedDate {
    _id: string;
    room: string;
    from: string;
    to: string;
    reason: string;
    isActive: boolean;
}

// Room IDs (Hardcoded for now based on fetch)
export const ROOM_IDS = {
    STANDARD: '698e070faa7fefd789aaeb09', // Standard Villa
    SUPERIOR: '698e070faa7fefd789aaeb0a'  // Family Villa (Frontend calls it Superior)
};
