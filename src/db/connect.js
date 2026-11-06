import { MongoClient } from 'mongodb';

let db;

// The unique index makes MongoDB reject duplicate custom ids, even when two
// create requests arrive at the same time. createIndex does nothing if the
// index already exists.
const createIndexes = async (database) => {
  await database.collection('authors').createIndex({ id: 1 }, { unique: true });
};

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
  await createIndexes(db);
  console.log(`Connected to MongoDB database: ${dbName}`);
  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDb first.');
  }
  return db;
};
