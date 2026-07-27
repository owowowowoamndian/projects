const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function fix() {
    await mongoose.connect(process.env.MONGO_URI);
    
    await User.deleteMany({username: {$in: ['buyer1', 'seller1', 'agent1']}});
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    console.log('Hash:', hash);
    
    await User.create([
        { username: 'buyer1', email: 'buyer1@test.com', password: hash, role: 'buyer' },
        { username: 'seller1', email: 'seller1@test.com', password: hash, role: 'seller' },
        { username: 'agent1', email: 'agent1@test.com', password: hash, role: 'agent' }
    ]);
    
    console.log('Created fresh users');
    await mongoose.disconnect();
}
fix();
