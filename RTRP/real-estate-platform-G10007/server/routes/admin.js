const router = require('express').Router();
const supabase = require('../config/supabase');
const verify = require('./verifyToken');
const verifyAdmin = require('./verifyAdmin');

const mapUser = (user) => {
    if (!user) return null;
    const { id, password, ...rest } = user;
    return { _id: id, ...rest };
};

const mapProperty = (p) => {
    if (!p) return null;
    const { id, user_id, ...rest } = p;
    return { _id: id, user: user_id, ...rest };
};

// Get Dashboard Stats (Admin only)
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: propertyCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
        
        const { data: properties } = await supabase.from('properties').select('price');
        const totalValue = properties ? properties.reduce((acc, curr) => acc + (curr.price || 0), 0) : 0;

        res.status(200).json({
            users: userCount,
            properties: propertyCount,
            totalValue
        });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get All Users (Admin only)
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const { data: users, error } = await supabase.from('users').select('*');
        if (error) throw error;
        res.status(200).json(users.map(mapUser));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete User
router.delete('/users/:id', verify, async (req, res) => {
    try {
        const { data: userToDelete } = await supabase.from('users').select('*').eq('id', req.params.id).single();
        await supabase.from('users').delete().eq('id', req.params.id);

        if (userToDelete && req.user) {
            await supabase.from('activity_logs').insert([{
                user_id: req.user.id,
                action: 'Deleted User',
                details: `Deleted user: "${userToDelete.username}"`
            }]);
        }
        res.status(200).json("User has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete Property (Admin Override)
router.delete('/properties/:id', verify, async (req, res) => {
    try {
        const { data: propToDelete } = await supabase.from('properties').select('*').eq('id', req.params.id).single();
        await supabase.from('properties').delete().eq('id', req.params.id);

        if (propToDelete && req.user) {
            await supabase.from('activity_logs').insert([{
                user_id: req.user.id,
                action: 'Deleted Property (Admin)',
                details: `Deleted property: "${propToDelete.title}"`
            }]);
        }
        res.status(200).json("Property has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Bulk Delete Properties
router.post('/properties/bulk-delete', verify, async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !ids.length) return res.status(400).json("No IDs provided");

        await supabase.from('properties').delete().in('id', ids);

        if (req.user) {
            await supabase.from('activity_logs').insert([{
                user_id: req.user.id,
                action: 'Bulk Deleted Properties',
                details: `Deleted ${ids.length} properties`
            }]);
        }
        res.status(200).json("Properties deleted successfully");
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update User
router.put('/users/:id', async (req, res) => {
    try {
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.status(200).json(mapUser(updatedUser));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update Property
router.put('/properties/:id', async (req, res) => {
    try {
        const { data: updatedProperty, error } = await supabase
            .from('properties')
            .update(req.body)
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.status(200).json(mapProperty(updatedProperty));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Generate Random Properties (Telangana, India)
router.post('/generate-properties', verifyAdmin, async (req, res) => {
    const { count } = req.body;
    const num = parseInt(count) || 5;

    const propertiesTemplate = [
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

    const generated = [];
    const userId = req.body.user || null;
    
    for (let i = 0; i < num; i++) {
        const base = propertiesTemplate[i % propertiesTemplate.length];
        const priceVariation = Math.floor((Math.random() - 0.5) * base.price * 0.1); // ±10%
        generated.push({
            title: base.title,
            location: base.location,
            description: base.description,
            price: base.price + priceVariation,
            pincode: base.pincode,
            image: base.image,
            user_id: userId
        });
    }

    try {
        const { error } = await supabase.from('properties').insert(generated);
        if (error) throw error;
        res.status(200).json({ message: `Successfully generated ${num} Telangana properties.` });
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get pending verifications
router.get('/pending-verifications', verify, async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .eq('verification_status', 'pending');
        if (error) throw error;
        res.status(200).json(users.map(mapUser));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Approve or reject verification
router.put('/verify-seller/:id', verify, async (req, res) => {
    try {
        const { status } = req.body; // 'verified' or 'rejected'
        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ verification_status: status })
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (error) throw error;
        
        if (req.user) {
            await supabase.from('activity_logs').insert([{
                user_id: req.user.id,
                action: `Seller ${status === 'verified' ? 'Verified' : 'Rejected'}`,
                details: `Updated verification status for: "${updatedUser.username}"`
            }]);
        }
        res.status(200).json(mapUser(updatedUser));
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
