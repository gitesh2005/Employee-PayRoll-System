const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

const connectDB = async () => {
    try {
        console.log("Connecting to MongoDB...");
        console.log("URI:", process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000
        });

        console.log("✅ MongoDB Connected Successfully to:", mongoose.connection.name);

    } catch (error) {
        console.error("❌ MongoDB Connection Error");
        console.error(error);
        process.exit(1);
    }
};

module.exports = connectDB;