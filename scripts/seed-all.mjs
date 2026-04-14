/**
 * Seed rooms, tours, and amenities
 * Run: node scripts/seed-all.mjs
 * Requires dev server running: npm run dev
 */

const BASE_URL = 'http://localhost:3000';

// ─── DATA ────────────────────────────────────────────────────────────────────

const ROOMS = [
    {
        type: 'Standard Villa',
        description: 'A spacious self-contained unit perfect for couples or solo travellers. Enjoy a fully equipped kitchen, private terrace with garden views, fast fiber WiFi, and your own laundry. Just a short stroll to Weligama Beach.',
        pricePerNight: 8500,
        maxGuests: 2,
        bedrooms: 1,
        beds: { king: 1, queen: 0, twin: 0 },
        size: '33',
        bathrooms: 1,
        hasAC: true,
        status: 'available',
        amenities: ['Air Conditioning', 'Full Kitchen', 'Free WiFi', 'Washing Machine', 'Private Bathroom', 'Hot Water', 'Private Terrace', 'Work Desk', 'Mosquito Nets', 'Bath Amenities'],
        images: [
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/af/c5/ab/ranmitha-villa-weligama.jpg?w=900&h=-1&s=1',
        ]
    },
    {
        type: 'Family Villa',
        description: 'A larger unit designed for families or small groups. Features a spacious living area, two bedrooms, a full kitchen for self-catering, and a generous private terrace. Ideal for longer stays with the comforts of home.',
        pricePerNight: 11000,
        maxGuests: 4,
        bedrooms: 2,
        beds: { king: 1, queen: 0, twin: 2 },
        size: '45',
        bathrooms: 1,
        hasAC: true,
        status: 'available',
        amenities: ['Air Conditioning', 'Full Kitchen', 'Free WiFi', 'Washing Machine', 'Private Bathroom', 'Hot Water', 'Private Terrace', 'Work Desk', 'Mosquito Nets', 'Bath Amenities'],
        images: [
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/5c/84/98/bed.jpg?w=900&h=-1&s=1',
        ]
    }
];

const TOURS = [
    {
        name: 'Spa & Wellness',
        description: 'Relax with our on-site beauty and wellness treatments including massages, facials, body scrubs, and manicures/pedicures. Our therapists come to the villa so you never have to leave.',
        price: 'On-Site',
        duration: 'Flexible',
        features: ['Massages & Scrubs', 'Facials', 'Manicure/Pedicure', 'Yoga Classes'],
        images: [
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/b1/d1/fa/beach.jpg?w=800&h=800&s=1',
        ]
    },
    {
        name: 'Surf & Water Sports',
        description: 'Weligama is a world-renowned surf spot with beginner-friendly waves. We arrange surf lessons, snorkeling, diving, and whale watching tours in nearby Mirissa.',
        price: 'From $25',
        duration: '2–3 Hours',
        features: ['Surf Lessons', 'Whale Watching', 'Snorkeling', 'Diving'],
        images: [
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/1b/e9/b6/bd/beach.jpg?w=800&h=800&s=1',
        ]
    },
    {
        name: 'Cultural Cooking Class',
        description: 'Learn to cook authentic Sri Lankan rice & curry with our family. Visit the local market, choose fresh ingredients, and master traditional recipes you can recreate at home.',
        price: 'Contact Us',
        duration: '3 Hours',
        features: ['Market Tour', 'Hands-on Cooking', 'Family Recipe', 'Lunch Included'],
        images: [
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/af/c5/ab/ranmitha-villa-weligama.jpg?w=800&h=800&s=1',
        ]
    },
    {
        name: 'Galle Fort Day Trip',
        description: 'Explore the UNESCO World Heritage site of Galle Fort — walk the ramparts, visit Dutch colonial buildings, browse boutique stores, and catch the sunset from the lighthouse.',
        price: 'Contact Us',
        duration: 'Half Day',
        features: ['Private Transport', 'Guided Tour', 'Sunset View', 'Shopping'],
        images: [
            'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/b1/d1/ad/stilt-fishing.jpg?w=800&h=800&s=1',
        ]
    }
];

const AMENITIES = [
    // Room amenities
    { label: 'Full Kitchen', description: 'Large fridge, stove, all cookware', icon: 'UtensilsCrossed', category: 'room', order: 1 },
    { label: 'Washing Machine', description: 'Private laundry facility', icon: 'Shirt', category: 'room', order: 2 },
    { label: 'Fiber WiFi', description: '25+ Mbps speed', icon: 'Wifi', category: 'room', order: 3 },
    { label: 'Air Conditioning', description: 'Plus ceiling fans', icon: 'Wind', category: 'room', order: 4 },
    { label: 'Large Bathroom', description: 'Hot water, bidet & shower', icon: 'ShowerHead', category: 'room', order: 5 },
    { label: 'Work Area', description: 'Desk & chair for remote workers', icon: 'Briefcase', category: 'room', order: 6 },
    { label: 'Private Terrace', description: '10.5m² garden views', icon: 'Droplets', category: 'room', order: 7 },
    { label: 'Soundproof Windows', description: 'Peaceful sleep guaranteed', icon: 'VolumeX', category: 'room', order: 8 },
    { label: 'Mosquito Nets', description: 'All beds covered', icon: 'Shield', category: 'room', order: 9 },
    { label: 'Bath Amenities', description: 'Towels, slippers & toiletries', icon: 'Sparkle', category: 'room', order: 10 },
    // Property amenities
    { label: 'Breakfast', description: 'Continental, 7–10 AM (fee)', icon: 'Coffee', category: 'property', order: 1 },
    { label: 'Spa & Wellness', description: 'Massage, scrubs, pedicure, yoga', icon: 'Flower', category: 'property', order: 2 },
    { label: 'Free Parking', description: 'Secure on-site', icon: 'Car', category: 'property', order: 3 },
    { label: '24/7 Front Desk', description: 'Always here to help', icon: 'Clock', category: 'property', order: 4 },
    { label: 'Rentals', description: 'Scooters & bicycles', icon: 'Bike', category: 'property', order: 5 },
    { label: 'Surf & Water Sports', description: 'Lessons arranged on request', icon: 'Waves', category: 'property', order: 6 },
    { label: 'Family Friendly', description: "Children's activities & babysitting", icon: 'Heart', category: 'property', order: 7 },
    { label: 'Tours & Transfers', description: 'Taxis, day trips & airport shuttle', icon: 'MapPin', category: 'property', order: 8 },
];

// ─── AUTH ─────────────────────────────────────────────────────────────────────

async function login() {
    const res = await fetch(`${BASE_URL}/api/user/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'imesh', password: '1234' }),
    });
    if (!res.ok) throw new Error(`Login failed: ${res.status}`);
    const cookie = res.headers.get('set-cookie');
    const token = cookie?.match(/admin_token=([^;]+)/)?.[1];
    if (!token) throw new Error('Could not extract admin_token');
    console.log('✓ Logged in\n');
    return token;
}

// ─── IMAGE HELPER ─────────────────────────────────────────────────────────────

async function fetchImageBlob(url) {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    return new Blob([buffer], { type: 'image/jpeg' });
}

// ─── SEED AMENITIES ───────────────────────────────────────────────────────────

async function seedAmenities(token) {
    console.log('── Amenities ──');
    let ok = 0, fail = 0;
    for (let i = 0; i < AMENITIES.length; i++) {
        const a = AMENITIES[i];
        const res = await fetch(`${BASE_URL}/api/amenity/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` },
            body: JSON.stringify(a),
        });
        if (res.ok) { console.log(`  ✓ [${i + 1}/${AMENITIES.length}] ${a.label} (${a.category})`); ok++; }
        else { const e = await res.json().catch(() => ({})); console.log(`  ✗ FAILED: ${a.label} — ${e.message || res.status}`); fail++; }
    }
    console.log(`  → ${ok} seeded, ${fail} failed\n`);
}

// ─── SEED ROOMS ───────────────────────────────────────────────────────────────

async function seedRooms(token) {
    console.log('── Rooms ──');
    let ok = 0, fail = 0;
    for (let i = 0; i < ROOMS.length; i++) {
        const r = ROOMS[i];
        const formData = new FormData();
        formData.append('type', r.type);
        formData.append('description', r.description);
        formData.append('pricePerNight', String(r.pricePerNight));
        formData.append('maxGuests', String(r.maxGuests));
        formData.append('bedrooms', String(r.bedrooms));
        formData.append('beds', JSON.stringify(r.beds));
        formData.append('size', r.size);
        formData.append('bathrooms', String(r.bathrooms));
        formData.append('hasAC', String(r.hasAC));
        formData.append('status', r.status);
        formData.append('amenities', JSON.stringify(r.amenities));

        for (let j = 0; j < r.images.length; j++) {
            const blob = await fetchImageBlob(r.images[j]);
            if (blob) formData.append(`image${j + 1}`, blob, `image${j + 1}.jpg`);
        }

        const res = await fetch(`${BASE_URL}/api/room/add`, {
            method: 'POST',
            headers: { Cookie: `admin_token=${token}` },
            body: formData,
        });
        if (res.ok) { console.log(`  ✓ [${i + 1}/${ROOMS.length}] ${r.type}`); ok++; }
        else { const e = await res.json().catch(() => ({})); console.log(`  ✗ FAILED: ${r.type} — ${e.message || res.status}`); fail++; }
    }
    console.log(`  → ${ok} seeded, ${fail} failed\n`);
}

// ─── SEED TOURS ───────────────────────────────────────────────────────────────

async function seedTours(token) {
    console.log('── Tours ──');
    let ok = 0, fail = 0;
    for (let i = 0; i < TOURS.length; i++) {
        const t = TOURS[i];
        const formData = new FormData();
        formData.append('name', t.name);
        formData.append('description', t.description);
        formData.append('price', t.price);
        formData.append('duration', t.duration);
        formData.append('features', JSON.stringify(t.features));

        for (let j = 0; j < t.images.length; j++) {
            const blob = await fetchImageBlob(t.images[j]);
            if (blob) formData.append(`image${j + 1}`, blob, `image${j + 1}.jpg`);
        }

        const res = await fetch(`${BASE_URL}/api/tour/create`, {
            method: 'POST',
            headers: { Cookie: `admin_token=${token}` },
            body: formData,
        });
        if (res.ok) { console.log(`  ✓ [${i + 1}/${TOURS.length}] ${t.name}`); ok++; }
        else { const e = await res.json().catch(() => ({})); console.log(`  ✗ FAILED: ${t.name} — ${e.message || res.status}`); fail++; }
    }
    console.log(`  → ${ok} seeded, ${fail} failed\n`);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('=== Seed: Rooms, Tours & Amenities ===\n');

    let token;
    try {
        token = await login();
    } catch (e) {
        console.error('Login error:', e.message);
        console.error('Make sure the dev server is running: npm run dev');
        process.exit(1);
    }

    await seedAmenities(token);
    await seedRooms(token);
    await seedTours(token);

    console.log('=== Done ===');
}

main();
