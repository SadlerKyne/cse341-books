import { getDb } from '../db/connect.js';

// Return only the fields in the spec so MongoDB's internal _id is never exposed.
const bookProjection = { _id: 0, id: 1, authorId: 1, title: 1, publicationDate: 1 };

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

export const createBook = async (book) => {
  // insertOne adds _id to the object it is given, so insert a copy.
  await getDb().collection('books').insertOne({ ...book });
  return book;
};

// Returns the updated book, or null if no book has that id.
export const updateBook = async (bookId, fields) => {
  return getDb()
    .collection('books')
    .findOneAndUpdate(
      { id: bookId },
      { $set: fields },
      { returnDocument: 'after', projection: bookProjection },
    );
};

// Returns true if a book was deleted, false if no book has that id.
export const deleteBook = async (bookId) => {
  const result = await getDb().collection('books').deleteOne({ id: bookId });
  return result.deletedCount > 0;
};

export const authorExists = async (authorId) => {
  const author = await getDb().collection('authors').findOne({ id: authorId });
  return author !== null;
};
