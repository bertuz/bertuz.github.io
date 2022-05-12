import { MongoClient } from 'mongodb';
const uri = process.env.DB_URI;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
let mongoGlobalPromise = global._mongoClientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (hot module replacement).
  if (!mongoGlobalPromise) {
    client = new MongoClient(uri!, options);
    mongoGlobalPromise = client.connect();
  }

  clientPromise = mongoGlobalPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri!, options);
  clientPromise = client.connect();
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global._mongoClientPromise = mongoGlobalPromise;

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;
