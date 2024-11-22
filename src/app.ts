import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

export default async function createServer() {
  await connectMongoDb();
  const app = express().use(express.json()).use(cors());
  return app;
}

async function connectMongoDb() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
  const MONGO_DB_NAME = process.env.MONGO_DB_NAME;
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME,
      minPoolSize: 5,
      retryWrites: true,
    });

    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}
