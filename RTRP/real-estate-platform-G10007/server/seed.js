const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createTestUsers() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = [
        { username: 'buyer1', email: 'buyer1@test.com', password: hashedPassword, role: 'buyer' },
        { username: 'seller1', email: 'seller1@test.com', password: hashedPassword, role: 'seller' },
        { username: 'agent1', email: 'agent1@test.com', password: hashedPassword, role: 'agent' }
    ];

    for (const userData of users) {
        const existing = await User.findOne({ username: userData.username });
        if (!existing) {
            await User.create(userData);
            console.log(`Created ${userData.role}: ${userData.username} / password123`);
        } else {
            console.log(`${userData.username} already exists`);
        }
    }

    console.log('\nTest Users (all use password: password123):');
    console.log('1. Buyer: buyer1 / password123');
    console.log('2. Seller: seller1 / password123');
    console.log('3. Agent: agent1 / password123');

    await mongoose.disconnect();
}

createTestUsers();
