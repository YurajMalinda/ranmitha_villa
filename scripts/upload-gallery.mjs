/**
 * Gallery bulk upload script
 * Run with: node scripts/upload-gallery.mjs
 * Make sure the dev server is running: npm run dev
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000';
const IMAGES_DIR = path.join(__dirname, '../public/images');

// ── Selected images ──────────────────────────────────────────────────────────
const IMAGES = [
  { file: 'Room 1/WhatsApp Image 2025-12-07 at 17.59.30.jpeg',      title: 'Ranmitha Villa Front View' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.04.53.jpeg',      title: 'Villa Entrance' },
  { file: 'WhatsApp Image 2025-12-07 at 17.59.33 (1).jpeg',         title: 'Villa Verandah & Garden' },
  { file: 'Room 1/WhatsApp Image 2025-12-07 at 17.59.32.jpeg',      title: 'Canopy Bed with Towels' },
  { file: 'Room 1/WhatsApp Image 2025-12-07 at 17.59.32 (1).jpeg',  title: 'Room with Garden View' },
  { file: 'Room 1/WhatsApp Image 2025-12-07 at 17.59.28.jpeg',      title: 'Dining Table & Chairs' },
  { file: 'Room 1/WhatsApp Image 2025-12-07 at 17.59.30 (1).jpeg',  title: 'Bathroom with Shower' },
  { file: 'Room 1/WhatsApp Image 2025-12-07 at 17.59.31 (1).jpeg',  title: 'Kitchen Counter' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.01.38.jpeg',      title: 'Spacious Room with Armchair' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.01.39.jpeg',      title: 'Four-Poster Canopy Bed' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.01.40 (1).jpeg',  title: 'Master Bed with Canopy' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.01.43.jpeg',      title: 'Room with Dining Area' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.05.00.jpeg',      title: 'Bright Bedroom with Chair' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.04.58.jpeg',      title: 'Kitchen & Dining Space' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.04.59 (1).jpeg',  title: 'Dining Room with Curtains' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.04.56 (1).jpeg',  title: 'Ensuite Bathroom' },
  { file: 'Room 2/WhatsApp Image 2025-12-07 at 18.04.56.jpeg',      title: 'Bathroom with Floral Tiles' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
async function login() {
  const res = await fetch(`${BASE_URL}/api/user/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'imesh', password: '1234' }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const cookie = res.headers.get('set-cookie');
  const token = cookie?.match(/admin_token=([^;]+)/)?.[1];
  if (!token) throw new Error('Could not extract admin_token from cookie');
  console.log('✓ Logged in\n');
  return token;
}

async function uploadImage(token, { file, title }, index) {
  const filePath = path.join(IMAGES_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`  ✗ [${index + 1}] File not found: ${file}`);
    return false;
  }

  const buffer = fs.readFileSync(filePath);
  const blob = new Blob([buffer], { type: 'image/jpeg' });
  const fd = new FormData();
  fd.append('image', blob, path.basename(file));
  fd.append('title', title);
  fd.append('alt', title);
  fd.append('order', String(index));

  const res = await fetch(`${BASE_URL}/api/gallery/create`, {
    method: 'POST',
    headers: { Cookie: `admin_token=${token}` },
    body: fd,
  });

  if (res.ok) {
    console.log(`  ✓ [${index + 1}/${IMAGES.length}] ${title}`);
    return true;
  } else {
    const err = await res.json().catch(() => ({}));
    console.log(`  ✗ [${index + 1}/${IMAGES.length}] FAILED: ${title} — ${err.message || res.status}`);
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('=== Gallery Upload Script ===\n');

  let token;
  try {
    token = await login();
  } catch (e) {
    console.error('Login error:', e.message);
    console.error('Make sure the dev server is running: npm run dev');
    process.exit(1);
  }

  let success = 0, failed = 0;
  for (let i = 0; i < IMAGES.length; i++) {
    const ok = await uploadImage(token, IMAGES[i], i);
    ok ? success++ : failed++;
  }

  console.log(`\n=== Done: ${success} uploaded, ${failed} failed ===`);
}

main();
