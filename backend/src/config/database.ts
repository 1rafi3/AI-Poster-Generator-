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
      console.warn('[Database] Failed to connect to specified MONGODB_URI:', err.message);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`[Database] Production connection failed to MONGODB_URI: ${err.message}`);
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('[Database] MONGODB_URI environment variable is required in production environment.');
  }

  try {
    console.log('[Database] Initializing embedded zero-config MongoDB (MongoMemoryServer)...');
    const memoryServerPkg = 'mongodb-memory-server';
    const { MongoMemoryServer } = (await import(memoryServerPkg as string)) as any;
    if (!(global as any).__MONGOD_INSTANCE__) {
      (global as any).__MONGOD_INSTANCE__ = await MongoMemoryServer.create();
    }
    const mongod = (global as any).__MONGOD_INSTANCE__;
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] Connected to embedded in-memory MongoDB at: ${uri}`);
  } catch (err: any) {
    console.error('[Database] Critical error initializing MongoDB connection:', err);
    throw err;
  }
}
