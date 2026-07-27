const router = require('express').Router();
const supabase = require('../config/supabase');
const verify = require('./verifyToken');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-verify-' + file.originalname);
    },
});
const upload = multer({ storage });

const mapUser = (user) => {
    if (!user) return null;
    const { id, password, ...rest } = user;
    return { _id: id, ...rest };
};

// Seller uploads verification document
router.post('/verify', verify, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json("No document uploaded");
        
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();
            
        if (userError || !user) throw userError || new Error("User not found");
        
        if (user.role !== 'seller') return res.status(403).json("Only sellers can verify");
        
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ 
                verification_document: req.file.filename,
                verification_status: 'pending' 
            })
            .eq('id', req.user.id)
            .select()
            .single();
            
        if (updateError) throw updateError;
        
        res.status(200).json(mapUser(updatedUser));
    } catch (err) {
        res.status(500).json(err);
    }
});

// Get current user
router.get('/me', verify, async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user.id)
            .single();
            
        if (error) throw error;
        
        res.status(200).json(mapUser(user));
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
