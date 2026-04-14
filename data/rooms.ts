export const roomsData = {
    title: {
        subtitle: "Accommodations",
        main: "Your Private",
        highlight: "Tropical Escape"
    },
    description: "Escape to your own slice of paradise in our spacious self-contained villas. Each unit comes with a full kitchen, private terrace, and everything you need for a perfect tropical stay — ideal for couples, families, and long-stay guests.",
    rooms: [
        {
            name: "Standard Villa",
            subtitle: "Perfect for Couples",
            price: "From $28",
            description: "A spacious 33m² open-plan retreat with a king-sized canopy bed, fully equipped kitchen, and large en-suite bathroom with hot water & bidet. Step out onto your 10.5m² private terrace overlooking the garden.",
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/af/c5/ab/ranmitha-villa-weligama.jpg?w=900&h=-1&s=1",
            size: "33 m²",
            guests: "2 Adults",
            beds: "1 King Bed",
            featured: true,
            amenities: [
                "Free Fiber WiFi",
                "Full Kitchen",
                "Private Terrace",
                "Air Conditioning",
                "Hot Water & Bidet"
            ]
        },
        {
            name: "Family Villa",
            subtitle: "Ideal for Families or Groups",
            price: "From $35",
            description: "Designed for families and small groups, this 33m² villa features flexible sleeping with a king canopy bed plus additional bed, a fully equipped kitchen, and a private garden terrace — everything for a comfortable extended stay.",
            image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/5c/84/98/bed.jpg?w=900&h=-1&s=1",
            size: "33 m²",
            guests: "4 Adults",
            beds: "1 King + 1 Full",
            featured: false,
            amenities: [
                "Free Fiber WiFi",
                "Full Kitchen",
                "Washing Machine",
                "Soundproof Windows",
                "Private Terrace"
            ]
        }
    ],
    rates: {
        title: "Seasonal Rates (Per Night)",
        columns: ["Season", "Travel Dates", "Standard Villa", "Superior Villa"],
        seasons: [
            {
                season: "Peak Season",
                dates: "Nov - Apr",
                standardPrice: "LKR 8,500",
                familyPrice: "LKR 11,500"
            },
            {
                season: "Off-Peak",
                dates: "May - Oct",
                standardPrice: "LKR 6,100",
                familyPrice: "LKR 8,400"
            }
        ],
        note: "Rates are subject to change. Long-stay discounts available for bookings of 7+ nights."
    }
};
