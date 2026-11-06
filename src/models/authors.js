import { getDb } from '../db/connect.js';

// Return only the fields in the spec so MongoDB's internal _id is never exposed.
const authorProjection = { _id: 0, id: 1, name: 1, birthYear: 1 };

export const getAllAuthors = async () => {
  return getDb()
    .collection('authors')
    .find({}, { projection: authorProjection })
    .sort({ id: 1 })
    .toArray();
};

export const getAuthorById = async (authorId) => {
  return getDb()
    .collection('authors')
    .findOne({ id: authorId }, { projection: authorProjection });
};

export const createAuthor = async (author) => {
  // insertOne adds _id to the object it is given, so insert a copy.
  await getDb().collection('authors').insertOne({ ...author });
  return author;
};

// Returns the updated author, or null if no author has that id.
export const updateAuthor = async (authorId, fields) => {
  return getDb()
    .collection('authors')
    .findOneAndUpdate(
      { id: authorId },
      { $set: fields },
      { returnDocument: 'after', projection: authorProjection },
    );
};

export const deleteAuthor = async (authorId) => {
  const result = await getDb().collection('authors').deleteOne({ id: authorId });
  return result.deletedCount > 0;
};

export const authorHasBooks = async (authorId) => {
  const book = await getDb().collection('books').findOne({ authorId });
  return book !== null;
};
