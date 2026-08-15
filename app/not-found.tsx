import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Page Not Found | Ranmitha Villa Weligama',
    description: 'The page you were looking for could not be found. Return to Ranmitha Villa — boutique villa 200m from Weligama Beach, Sri Lanka.',
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p className="text-[#2E5D4B] uppercase tracking-widest text-sm font-semibold mb-4">404 — Page Not Found</p>
                <h1 className="text-6xl font-serif text-[#2A2018] mb-4">Oops!</h1>
                <p className="text-gray-600 leading-relaxed mb-8">
                    Looks like this page has drifted out to sea. Let&apos;s get you back to the villa.
                </p>
                <Link
                    href="/"
                    className="inline-block bg-[#2E5D4B] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1E4A3A] transition-colors duration-200"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
