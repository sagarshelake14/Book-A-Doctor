const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const dns = require('node:dns');

// 1. Force Node.js to use Google and Cloudflare DNS servers first
dns.setServers(['8.8.8.8', '1.1.1.1']);

// 2. Now initiate the database connection
mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.on('connected', () => {
    console.log("MongoDB connection successful");
});

connection.on('error', (err) => {
    console.log("MongoDB connection failed");
});