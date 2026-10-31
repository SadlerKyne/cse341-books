import { MongoClient } from 'mongodb';

let db;

export const connectToDb = async () => {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!uri || !dbName) {
    throw new Error('MONGODB_URI and MONGODB_DB_NAME must be set');
  }

  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log(`Connected to MongoDB database: ${dbName}`);
  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }
  return db;
};
