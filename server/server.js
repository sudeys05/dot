// Import dependencies
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000; // Default port 5000

// MongoDB connection URI (add your credentials here)
const mongoURI = process.env.MONGO_URI; // Example: 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/myDatabase'

// Connect to MongoDB using Mongoose
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Basic route to test server
app.get('/', (req, res) => {
  res.send('Hello, MongoDB Atlas!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});