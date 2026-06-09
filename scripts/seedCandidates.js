require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');

const defaultCandidates = [
  { name: "Alabi Emmanuel", position: "President" },
  { name: "Chinedu Okafor", position: "Vice President" },
  { name: "Aminu Umar", position: "Public Relations Officer" }
];

async function seedCandidates() {
  try {
    console.log('Connecting to MongoDB to seed candidates');
    await mongoose.connect(process.env.MONGO_URL);


    await Candidate.deleteMany();

    
    await Candidate.insertMany(defaultCandidates);
    console.log('Successfully seeded default candidates into the database!');
  } catch (error) {
    console.error('Error seeding candidates:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seedCandidates();