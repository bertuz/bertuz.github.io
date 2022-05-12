// Import the dependency.
import { MongoClient } from 'mongodb';

import type { MongoClientOptions } from 'mongodb';
const uri = process.env.DB_URI!;

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
} as MongoClientOptions;

let client;
let clientPromise: Promise<MongoClient>;
const globalWithMongoClientPromise = global as typeof globalThis & {
  _mongoClientPromise: Promise<MongoClient>;
};

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (hot module replacement).
  if (!globalWithMongoClientPromise._mongoClientPromise) {
    client = new MongoClient(uri!, options);
    globalWithMongoClientPromise._mongoClientPromise = client.connect();
  }
  clientPromise =
    globalWithMongoClientPromise._mongoClientPromise as Promise<MongoClient>;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri!, options);
  clientPromise = client.connect();
}
// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
