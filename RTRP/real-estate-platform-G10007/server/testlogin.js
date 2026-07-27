const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
    await mongoose.connect(process.env.MONGO_URI);
    
    const user = await User.findOne({ username: 'admin' });
    if (!user) {
        console.log('ERROR: No user with username "admin" found!');
        const allUsers = await User.find({}, 'username role');
        console.log('All users:', allUsers);
        await mongoose.disconnect();
        return;
    }
    
    console.log('Found user:', { username: user.username, role: user.role, email: user.email });
    console.log('Password hash:', user.password);
    
    // Test password "admin"
    const valid1 = await bcrypt.compare('admin', user.password);
    console.log('Password "admin" matches:', valid1);
    
    // Test password "admin123" (from createAdmin.js)
    const valid2 = await bcrypt.compare('admin123', user.password);
    console.log('Password "admin123" matches:', valid2);
    
    await mongoose.disconnect();
    console.log('Done.');
}
testLogin().catch(console.error);
