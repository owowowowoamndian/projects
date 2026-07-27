
const mongoose = require('mongoose');
require('dotenv').config();

const uri = 'mongodb://ramaprasad24_db_user:Yn7UyhOd9mljKHSJ@ac-8nvwxeu-shard-00-00.azrhom2.mongodb.net:27017,ac-8nvwxeu-shard-00-01.azrhom2.mongodb.net:27017,ac-8nvwxeu-shard-00-02.azrhom2.mongodb.net:27017/realestate?ssl=true&replicaSet=atlas-109gkw-shard-0&authSource=admin&retryWrites=true&w=majority';
console.log('Testing connection to:', uri);

mongoose.connect(uri)
    .then(() => {
        console.log('MongoDB connected successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
