require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User'); 

async function makeAdmin() {
    try {
       
        const emailArgument = process.argv.find(arg => arg.startsWith('--email='));

        if (!emailArgument) {
            console.log('Missing required flag. Usage: npm run make-admin -- --email=voter@quorum.local');
            return; 
        }

        const targetEmail = emailArgument.split('=')[1];

        console.log('Connecting to MongoDB Atlas');
        await mongoose.connect(process.env.MONGO_URL); 
        console.log('Connected');

       
        const user = await User.findOne({ email: targetEmail });
        
        if (!user) {
            console.error(`User not found with email: ${targetEmail}`);
            return;
        }

        
        user.role = 'admin'; 
        await user.save();
        
        console.log(`Success! ${user.username} has been updated to admin.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        
        await mongoose.connection.close();
        console.log('Database connection safely closed.');
    }
}

makeAdmin();