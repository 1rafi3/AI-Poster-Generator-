import mongoose from 'mongoose';

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  const customUri = process.env.MONGODB_URI;

  if (customUri && customUri.trim() !== '') {
    try {
      console.log(`[Database] Connecting to MongoDB at: ${customUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
      await mongoose.connect(customUri);
      console.log('[Database] Successfully connected to MongoDB.');
      return;
    } catch (err: any) {
      console.warn('[Database] Failed to connect to specified MONGODB_URI. Falling back to embedded in-memory MongoDB...', err.message);
    }
  }

  try {
    console.log('[Database] Initializing embedded zero-config MongoDB (MongoMemoryServer)...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Connected to embedded in-memory MongoDB at: ${uri}`);
  } catch (err: any) {
    console.error('[Database] Critical error initializing MongoDB connection:', err);
    throw err;
  }
}
