export default function Loading() {
    return (
        <div className="min-h-screen bg-white animate-pulse">
            {/* Navbar skeleton */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-gray-100 z-50" />

            {/* Hero skeleton */}
            <div className="h-screen bg-gray-200" />

            {/* Welcome section skeleton */}
            <div className="py-20 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-4">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                    <div className="h-8 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
                <div className="h-80 bg-gray-200 rounded-2xl" />
            </div>

            {/* Rooms skeleton */}
            <div className="py-20 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2].map((i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden">
                                <div className="h-64 bg-gray-200" />
                                <div className="p-6 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
