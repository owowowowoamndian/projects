const router = require('express').Router();
const supabase = require('../config/supabase');
const verify = require('./verifyToken');

// Get All Logs (Admin Only)
router.get('/', verify, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json("You are not authorized to view logs.");
        }

        const { data: logs, error } = await supabase
            .from('activity_logs')
            .select('*, user:users(username, email, role)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedLogs = logs.map(log => ({
            _id: log.id,
            action: log.action,
            details: log.details,
            createdAt: log.created_at,
            user: log.user
        }));

        res.status(200).json(mappedLogs);
    } catch (err) {
        console.error("Fetch Logs Error:", err);
        res.status(500).json(err);
    }
});

module.exports = router;
