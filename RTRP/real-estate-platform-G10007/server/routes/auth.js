const router = require('express').Router();
const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to map Supabase row to frontend expected format
const mapUser = (user) => {
    if (!user) return null;
    const { id, password, ...rest } = user;
    return { _id: id, ...rest };
};

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (username && username.toLowerCase() === 'admin') {
            return res.status(403).json("The username 'admin' is reserved and cannot be registered.");
        }

        if (role === 'admin') {
            return res.status(403).json("You cannot register as an admin through this portal.");
        }

        const allowedRoles = ['buyer', 'seller', 'agent'];
        const assignedRole = allowedRoles.includes(role) ? role : 'buyer';

        // Check if username or email exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { data: user, error } = await supabase
            .from('users')
            .insert([{ username, email, password: hashedPassword, role: assignedRole }])
            .select()
            .single();

        if (error) throw error;

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "5d" }
        );

        await supabase.from('activity_logs').insert([{
            user_id: user.id,
            action: 'User Registered',
            details: `New account created: ${user.username} (${user.role})`
        }]);

        res.status(200).json({ ...mapUser(user), token });
    } catch (err) {
        console.error("Register Error:", err);
        const message = err.message || 'Registration failed. Please try again.';
        res.status(500).json({ message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', req.body.username)
            .single();

        if (error || !user) {
            return res.status(404).json("User not found!");
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json("Wrong credentials!");

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "secretkey",
            { expiresIn: "5d" }
        );

        await supabase.from('activity_logs').insert([{
            user_id: user.id,
            action: 'User Logged In',
            details: `Successful login by: ${user.username}`
        }]);

        res.status(200).json({ ...mapUser(user), token });
    } catch (err) {
        console.error("Login Error Details:", err);
        const message = err.message || 'Internal server error. Please try again.';
        res.status(500).json({ message });
    }
});

module.exports = router;
