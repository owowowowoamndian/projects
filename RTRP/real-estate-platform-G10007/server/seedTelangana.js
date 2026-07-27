require('dotenv').config();
const telanganaProperties = [
    {
        title: "Luxury 4BHK Villa in Jubilee Hills",
        location: "Jubilee Hills, Hyderabad, Telangana",
        description: "Stunning 4BHK independent villa in the prime locality of Jubilee Hills. Features marble flooring, modular kitchen, home theatre, landscaped garden, and 24/7 security. Walking distance to top schools, hospitals and malls.",
        price: 18500000,
        pincode: "500033",
        image: "https://images.unsplash.com/photo-1600596542815-e32c8cc13bc9?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Premium 3BHK Flat in Banjara Hills",
        location: "Banjara Hills, Hyderabad, Telangana",
        description: "Spacious 3BHK apartment on the 12th floor with panoramic city views. Fully air-conditioned with premium fittings, covered parking, rooftop gym and swimming pool. Located in Hyderabad's most prestigious address.",
        price: 12000000,
        pincode: "500034",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Modern 2BHK Apartment in HITEC City",
        location: "HITEC City, Hyderabad, Telangana",
        description: "Contemporary 2BHK flat just 500m from the IT corridor. Ideal for tech professionals — high-speed fibre internet, 24/7 power backup, co-working lounge, and easy metro connectivity. Ready to move in.",
        price: 7800000,
        pincode: "500081",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Duplex Villa in Gachibowli",
        location: "Gachibowli, Hyderabad, Telangana",
        description: "Elegant G+1 duplex villa in the booming Gachibowli tech zone. 4 bedrooms, 4 bathrooms, private terrace garden, solar panels, and a private basement parking for 3 cars. Excellent rental yield potential.",
        price: 22000000,
        pincode: "500032",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Budget 1BHK Studio in Kukatpally",
        location: "Kukatpally, Hyderabad, Telangana",
        description: "Compact and affordable 1BHK studio apartment perfect for young professionals and students. Close to JNTU, IKEA and major bus routes. Society amenities include a gym, children's play area and 24-hour security.",
        price: 3500000,
        pincode: "500072",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Farmhouse Retreat in Shankarpally",
        location: "Shankarpally, Ranga Reddy, Telangana",
        description: "Lush 2-acre farmhouse estate on the outskirts of Hyderabad. Features a 3BHK bungalow, fruit orchards, organic farm, and a private swimming pool. Perfect as a weekend retreat or permanent eco-lifestyle residence.",
        price: 35000000,
        pincode: "501203",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "3BHK Gated Community Villa in Kompally",
        location: "Kompally, Hyderabad, Telangana",
        description: "Beautiful 3BHK villa in a premium gated community. Includes clubhouse, indoor badminton court, Zen garden, and jogging track. Vaastu compliant with North-East facing. Schools and hospitals within 2km radius.",
        price: 9500000,
        pincode: "500014",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Investment Plot in Warangal Urban",
        location: "Warangal Urban, Telangana",
        description: "Prime 200 sq yd residential plot in the fast-developing Warangal Urban zone. HMDA/DTCP approved layout, fully compound walled, with road facing. Excellent appreciation potential near the proposed IT Special Economic Zone.",
        price: 4200000,
        pincode: "506002",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Heritage Bungalow in Secunderabad",
        location: "Secunderabad, Hyderabad, Telangana",
        description: "Rare independent bungalow on a 500 sq yd plot in Secunderabad cantonment area. Colonial-era architecture beautifully restored with modern interiors. 5 bedrooms, large verandah, and a lush private garden.",
        price: 28000000,
        pincode: "500003",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "High-Rise 2BHK in Kokapet Financial District",
        location: "Kokapet, Hyderabad, Telangana",
        description: "Luxury 2BHK in a 40-storey high-rise tower in the upcoming Financial District. Sky lounge, infinity pool, concierge service, and spectacular views of Osman Sagar lake. RERA registered, OC received.",
        price: 9200000,
        pincode: "500075",
        image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Independent House in Nizamabad",
        location: "Nizamabad, Telangana",
        description: "Well-maintained G+1 independent house in the heart of Nizamabad city. 4 bedrooms, 2 car parking, bore well, and municipal water connection. Ideal for a joint family. Close to government offices and railway station.",
        price: 5500000,
        pincode: "503001",
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Penthouse in Madhapur",
        location: "Madhapur, Hyderabad, Telangana",
        description: "Exclusive 5000 sqft penthouse on the 32nd floor of Hyderabad's tallest luxury tower. Private terrace with jacuzzi, 5 bedrooms with ensuite baths, home automation, and a private lift lobby. The pinnacle of Hyderabad luxury living.",
        price: 65000000,
        pincode: "500081",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"
    }
];

const supabase = require('./config/supabase');

async function seedProperties() {
    try {
        console.log('Connected to Supabase');

        // Delete ALL existing properties (wipe old data)
        const { error: deleteError } = await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) throw deleteError;
        console.log(`Deleted old properties`);

        // Insert fresh Telangana properties
        const { data: inserted, error: insertError } = await supabase.from('properties').insert(telanganaProperties).select();
        if (insertError) throw insertError;

        console.log(`Successfully seeded ${inserted.length} Telangana properties!`);

        inserted.forEach(p => console.log(` - ${p.title} | ₹${p.price.toLocaleString('en-IN')}`));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        console.log('Done.');
    }
}

seedProperties();
