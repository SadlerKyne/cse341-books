import { getDb } from '../db/connect.js';

// Return only the fields in the spec so MongoDB's internal _id is never exposed.
const bookProjection = { _id: 0, id: 1, author: 1, title: 1, publicationDate: 1 };

export const getAllBooks = async () => {
  return getDb()
    .collection('books')
    .find({}, { projection: bookProjection })
    .sort({ id: 1 })
    .toArray();
};

export const getBookById = async (bookId) => {
  return getDb()
    .collection('books')
    .findOne({ id: bookId }, { projection: bookProjection });
};
