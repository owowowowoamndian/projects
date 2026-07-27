const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixAdminRole() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find all users named 'admin'
    const admins = await User.find({ username: { $regex: /^admin$/i } });
    console.log('Users named admin:', JSON.stringify(admins.map(u => ({ id: u._id, username: u.username, role: u.role, email: u.email })), null, 2));
    
    // Fix any admin-named users that are NOT already set as admin role
    const fixed = await User.updateMany(
        { username: { $regex: /^admin$/i }, role: { $ne: 'admin' } },
        { $set: { role: 'admin' } }
    );
    console.log('Fixed admin role records:', fixed.modifiedCount);
    
    await mongoose.disconnect();
    console.log('Done.');
}
fixAdminRole().catch(console.error);
