import mongoose from 'mongoose';

/**
 * Global type augmentation for mongoose connection caching
 * This prevents TypeScript errors when accessing global.mongoose
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Initialize the global mongoose cache object
 * This is necessary to preserve the connection across hot reloads in development
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Establishes and returns a cached MongoDB connection
 * 
 * In development mode, Next.js hot reload can cause multiple database connections.
 * This function ensures we reuse the existing connection instead of creating new ones.
 * 
 * @returns {Promise<mongoose.Connection>} - The active MongoDB connection
 */
async function connectDB(): Promise<mongoose.Connection> {
  // Return existing connection if already established
  if (cached.conn) {
    return cached.conn;
  }

  // If no existing promise, create a new connection
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false, // Disable mongoose buffering to fail fast if not connected
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance.connection;
    });
  }

  try {
    // Await the connection promise and cache the connection
    cached.conn = await cached.promise;
  } catch (error) {
    // Clear the promise on error so the next call attempts a fresh connection
    cached.promise = null;
    throw error;
  }

  return cached.conn;
}

export default connectDB;
