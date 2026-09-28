// Ambient module declarations for optional development dependencies
declare module 'mongodb-memory-server' {
  export const MongoMemoryServer: {
    create: () => Promise<any>;
  };
}
