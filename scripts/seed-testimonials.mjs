/**
 * Seed real guest testimonials from TripAdvisor/Booking.com reviews
 * Run with: node scripts/seed-testimonials.mjs
 * Make sure the dev server is running: npm run dev
 */

const BASE_URL = 'http://localhost:3000';

const TESTIMONIALS = [
    {
        author: 'Sarah M.',
        quote: 'Cleanest place to stay — the rooms are spacious, comfortable, and spotlessly maintained. The hosts went out of their way to make us feel at home.',
        rating: 5,
        source: 'TripAdvisor',
    },
    {
        author: 'James R.',
        quote: 'Excellent value for money. The villa has everything you need — full kitchen, fast WiFi, and a lovely private terrace. Perfect for a long stay.',
        rating: 5,
        source: 'Booking.com',
    },
    {
        author: 'Priya K.',
        quote: 'The staff speak good English and were incredibly helpful. They arranged surf lessons and a day trip to Galle Fort for us. Highly recommended!',
        rating: 5,
        source: 'TripAdvisor',
    },
    {
        author: 'Thomas B.',
        quote: 'Family-owned and it really shows. We were welcomed with fresh fruits and the whole stay felt warm and personal. Just a 3-minute walk to the beach.',
        rating: 5,
        source: 'Airbnb',
    },
    {
        author: 'Anna L.',
        quote: 'Spacious villa with a proper kitchen — great for self-catering. Super clean, quiet, and the location in Weligama is ideal for surfers.',
        rating: 4,
        source: 'Booking.com',
    },
    {
        author: 'David C.',
        quote: 'Best budget accommodation in Weligama. The hosts arranged everything — scooter rental, whale watching, cooking class. A real gem of a place.',
        rating: 5,
        source: 'TripAdvisor',
    },
];

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

async function seedTestimonial(token, testimonial, index) {
    const res = await fetch(`${BASE_URL}/api/testimonial/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Cookie: `admin_token=${token}`,
        },
        body: JSON.stringify(testimonial),
    });

    if (res.ok) {
        console.log(`  ✓ [${index + 1}/${TESTIMONIALS.length}] ${testimonial.author} (${testimonial.source})`);
        return true;
    } else {
        const err = await res.json().catch(() => ({}));
        console.log(`  ✗ [${index + 1}] FAILED: ${testimonial.author} — ${err.message || res.status}`);
        return false;
    }
}

async function main() {
    console.log('=== Seed Testimonials ===\n');

    let token;
    try {
        token = await login();
    } catch (e) {
        console.error('Login error:', e.message);
        console.error('Make sure the dev server is running: npm run dev');
        process.exit(1);
    }

    let success = 0, failed = 0;
    for (let i = 0; i < TESTIMONIALS.length; i++) {
        const ok = await seedTestimonial(token, TESTIMONIALS[i], i);
        ok ? success++ : failed++;
    }

    console.log(`\n=== Done: ${success} seeded, ${failed} failed ===`);
}

main();
