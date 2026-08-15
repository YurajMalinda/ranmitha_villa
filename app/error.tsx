'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen bg-[#FBF8F3] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <p className="text-[#D4784A] uppercase tracking-widest text-sm font-semibold mb-4">
                    Something went wrong
                </p>
                <h2 className="text-4xl font-serif text-[#2A2018] mb-4">
                    Unexpected Error
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                    We&apos;re sorry — something went wrong on our end. Please try again or contact us directly if the problem persists.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="bg-[#2E5D4B] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1E4A3A] transition-colors duration-200"
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="border border-[#2E5D4B] text-[#2E5D4B] px-8 py-3 rounded-full font-semibold hover:bg-[#EFF7F3] transition-colors duration-200"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    )
}
