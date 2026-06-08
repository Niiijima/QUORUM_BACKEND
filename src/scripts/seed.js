require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/Campaign');

async function seedDatabase(){
    try{
        console.log('Connecting to MongoDB Atlas.');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected');

        console.log('Clearing old data.');
        await User.deleteMany({});
        await Campaign.deleteMany({});

        console.log('Adding new users.');
        const adminUser = await User.create({
            username: 'Iyinoluwa_Admin',
      email: 'admin@quorum.local',
      role: 'admin',
      walletBalance: 5000,
    });

    const standardUser = await User.create({
      username: 'TestVoter',
      email: 'voter@quorum.local',
      role: 'user',
      walletBalance: 100,
    });
    
    console.log('Creating sample campaigns.');
    await Campaign.create({
      title: 'Upgrade Camus Wifi Hubs',
      description: 'A campaign to fund the installation of high-speed wifi hubs across the campus.',
      creator: adminUser._id,
      fundsRaised: 5000,
      status: 'active',
    });

    console.log('Database seeding completed successfully.');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}

seedDatabase();