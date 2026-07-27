const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({ username: { $in: ['buyer1', 'seller1', 'agent1'] } });
    console.log('Found users:', JSON.stringify(users, null, 2));
    await mongoose.disconnect();
}
check();
