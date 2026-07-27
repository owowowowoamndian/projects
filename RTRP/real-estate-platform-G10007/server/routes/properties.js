const router = require('express').Router();
const supabase = require('../config/supabase');
const verify = require('./verifyToken');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
const upload = multer({ storage });

const mapProperty = (p) => {
    if (!p) return null;
    const { id, user_id, ...rest } = p;
    return { _id: id, user: user_id, ...rest };
};

// Create Property with Image Upload
router.post('/', upload.single('image'), async (req, res) => {
    const { title, description, price, location, pincode, user } = req.body;
    const imagePath = req.file ? req.file.filename : req.body.image;

    // Default UUID if none provided
    const userId = user || '00000000-0000-0000-0000-000000000000';

    try {
        const { data: savedProperty, error } = await supabase
            .from('properties')
            .insert([{
                title, description, price, location, pincode,
                image: imagePath,
                user_id: userId
            }])
            .select()
            .single();

        if (error) throw error;

        await supabase.from('activity_logs').insert([{
            user_id: userId,
            action: 'Created Property',
            details: `Created listing: "${savedProperty.title}"`
        }]);

        res.status(200).json(mapProperty(savedProperty));
    } catch (err) {
        console.error("Save Error:", err);
        res.status(500).json(err);
    }
});

// Get All Properties
router.get('/', async (req, res) => {
    try {
        const { data: properties, error } = await supabase
            .from('properties')
            .select('*');
            
        if (error) throw error;
        res.status(200).json(properties.map(mapProperty));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get Single Property
router.get('/:id', async (req, res) => {
    try {
        const { data: property, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;

        // Increment views
        const newViews = (property.views || 0) + 1;
        const { data: updatedProperty, error: updateError } = await supabase
            .from('properties')
            .update({ views: newViews })
            .eq('id', req.params.id)
            .select()
            .single();
            
        if (updateError) throw updateError;

        res.status(200).json(mapProperty(updatedProperty));
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get('/user/stats', verify, async (req, res) => {
    try {
        const { data: userProperties, error } = await supabase
            .from('properties')
            .select('*')
            .eq('user_id', req.user.id);
            
        if (error) throw error;

        const totalViews = userProperties.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const totalListings = userProperties.length;

        res.status(200).json({
            totalListings,
            totalViews,
            properties: userProperties.map(mapProperty)
        });
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json(err);
    }
});

// Generate Description (AI Placeholder)
router.post('/generate-description', async (req, res) => {
    const { title, location, price } = req.body;
    const formattedPrice = Number(price).toLocaleString('en-IN');
    const descriptions = [
        `Discover your dream home with this stunning property in ${location}. Priced at ₹${formattedPrice}, "${title}" offers a perfect blend of modern luxury and Vaastu-compliant comfort. Featuring premium amenities, dedicated parking, and a prime location, this is an opportunity you don't want to miss. Contact us today to schedule a site visit!`,
        `Experience the pinnacle of elegance at "${title}". This exclusive residence in ${location} is a masterpiece of design, available for ₹${formattedPrice}. With spacious interiors, 24/7 power backup, and breathtaking city views, it redefines premium living in Telangana. A true gem for the discerning homebuyer.`,
        `Prime investment opportunity in ${location}! "${title}" is now on the market for ₹${formattedPrice}. Whether you're looking for a new family home or a high-yield rental asset in a fast-developing IT corridor, this property checks all the boxes. HMDA approved, clear title, and priced to sell quickly.`
    ];
    res.status(200).json({ descriptions });
});

module.exports = router;
