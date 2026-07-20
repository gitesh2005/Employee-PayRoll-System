require("dotenv").config();
const { MongoClient } = require("mongodb");

async function run() {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    console.log("✅ MongoDB Driver Connected");
    await client.close();
  } catch (err) {
    console.error(err);
  }
}

run();