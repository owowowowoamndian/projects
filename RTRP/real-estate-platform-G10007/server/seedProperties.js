const mongoose = require('mongoose');
const Property = require('./models/Property');
const User = require('./models/User');
require('dotenv').config();

async function seedProperties() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate');
        console.log("Connected to MongoDB...");

        // Fetch a user to associate the properties with
        const agent = await User.findOne({ username: 'agent1' });
        
        let agentId = null;
        if (agent) {
            agentId = agent._id;
            console.log("Found agent1, linking properties to this user.");
        } else {
            console.log("User agent1 not found, properties will have no associated user.");
        }

        const sampleProperties = [
            {
                title: "Skyline Oasis Penthouse",
                description: "Experience unparalleled luxury in this breathtaking penthouse. Featuring floor-to-ceiling windows with panoramic city views, a private rooftop terrace, and custom Italian marble finishes throughout.",
                price: 5200000,
                location: "Manhattan, New York",
                pincode: "10019",
                image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
                user: agentId,
                views: 342
            },
            {
                title: "Serene Coastal Villa",
                description: "A masterful blend of modern architecture and natural beauty. This beachfront villa offers 6 bedrooms, an infinity pool merging with the ocean horizon, and a private dock.",
                price: 8500000,
                location: "Malibu, California",
                pincode: "90265",
                image: "https://images.unsplash.com/photo-1613490908578-8318182283a0?auto=format&fit=crop&w=1200&q=80",
                user: agentId,
                views: 890
            },
            {
                title: "Architectural Glass House",
                description: "Nestled in a private wooded enclave, this award-winning glass house brings nature indoors. Features radiant heated floors, a chef's kitchen, and a detached art studio.",
                price: 3100000,
                location: "Portland, Oregon",
                pincode: "97205",
                image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
                user: agentId,
                views: 512
            },
            {
                title: "Historic Brownstone Estate",
                description: "Meticulously restored 19th-century brownstone featuring original mahogany woodwork, 5 wood-burning fireplaces, a landscaped garden, and a modern climate-controlled wine cellar.",
                price: 4750000,
                location: "Boston, Massachusetts",
                pincode: "02116",
                image: "https://images.unsplash.com/photo-1600607688969-a5bfcd64bd28?auto=format&fit=crop&w=1200&q=80",
                user: agentId,
                views: 420
            },
            {
                title: "Ultra-Modern Tech Mansion",
                description: "The home of the future. Fully automated via a central AI system, this estate includes a 20-car subterranean garage, indoor basketball court, and biometric security systems.",
                price: 12500000,
                location: "Austin, Texas",
                pincode: "78704",
                image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
                user: agentId,
                views: 1250
            }
        ];

        // Clear existing test properties if you want (optional, but let's just add new ones for now)
        // await Property.deleteMany({});
        
        console.log("Inserting sample properties...");
        await Property.insertMany(sampleProperties);
        console.log(`${sampleProperties.length} properties added successfully!`);

    } catch (err) {
        console.error("Error seeding properties: ", err);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB.");
    }
}

seedProperties();
