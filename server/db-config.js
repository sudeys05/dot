// Database configuration for MongoDB Atlas only
import { mongoStorage } from './mongodb-storage.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required! Please set it in your .env file.');
}

console.log('Using MongoDB Atlas storage');
console.log('Connecting to:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs

// Connect to MongoDB
try {
  await mongoStorage.connect(MONGODB_URI);
  console.log('MongoDB connected successfully');
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  throw new Error('Failed to connect to MongoDB Atlas. Please check your connection string and network access.');
}

export { mongoStorage as storage };