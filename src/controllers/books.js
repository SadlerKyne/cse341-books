import { getAllBooks } from '../models/books.js';

export const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (err) {
    console.error('Error retrieving books:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
