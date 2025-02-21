import { MongoClient, Db } from 'mongodb';
import dotenv from "dotenv"

dotenv.config()

const MONGODB_URI = process.env.VITE_MONGO_URI || ''; // MongoDB connection URI

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable.');
}

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (!client) {
    client = new MongoClient(MONGODB_URI, {minPoolSize : 100, maxPoolSize : 1000}); // Setting Pool Size to mitigate performance issues
    await client.connect();
    db = client.db('E-Summit');
    console.log('Connected to MongoDB');
  }
  
  return db;
}