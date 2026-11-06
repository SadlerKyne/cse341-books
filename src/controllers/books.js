import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  authorExists,
} from '../models/books.js';
import {
  isNonEmptyString,
  isValidDate,
  isDuplicateKeyError,
} from '../utils/validation.js';

const dateMessage = 'publicationDate must use the format YYYY-MM-DD';
const authorMessage = 'Author not found for authorId';

export const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    return res.status(200).json(books);
  } catch (err) {
    console.error('Error retrieving books:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const book = await getBookById(requestedId);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(200).json(book);
  } catch (err) {
    console.error(`Error retrieving book ${requestedId}:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBookHandler = async (req, res) => {
  const { id, authorId, title, publicationDate } = req.body ?? {};

  if (![id, authorId, title, publicationDate].every(isNonEmptyString)) {
    return res
      .status(400)
      .json({ message: 'id, authorId, title, and publicationDate are required strings' });
  }
  if (!isValidDate(publicationDate.trim())) {
    return res.status(400).json({ message: dateMessage });
  }

  // Build the document from known fields only so clients cannot add extra fields.
  const book = {
    id: id.trim(),
    authorId: authorId.trim(),
    title: title.trim(),
    publicationDate: publicationDate.trim(),
  };

  try {
    if (!(await authorExists(book.authorId))) {
      return res.status(400).json({ message: authorMessage });
    }

    const createdBook = await createBook(book);
    return res.status(201).json(createdBook);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return res.status(400).json({ message: 'A book with that id already exists' });
    }
    console.error('Error creating book:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBookHandler = async (req, res) => {
  const requestedId = req.params.id;
  const { authorId, title, publicationDate } = req.body ?? {};

  if (![authorId, title, publicationDate].every(isNonEmptyString)) {
    return res
      .status(400)
      .json({ message: 'authorId, title, and publicationDate are required strings' });
  }
  if (!isValidDate(publicationDate.trim())) {
    return res.status(400).json({ message: dateMessage });
  }

  // The id comes from the URL; an id in the body is ignored so ids cannot change.
  const fields = {
    authorId: authorId.trim(),
    title: title.trim(),
    publicationDate: publicationDate.trim(),
  };

  try {
    if (!(await getBookById(requestedId))) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (!(await authorExists(fields.authorId))) {
      return res.status(400).json({ message: authorMessage });
    }

    const updatedBook = await updateBook(requestedId, fields);
    return res.status(200).json(updatedBook);
  } catch (err) {
    console.error(`Error updating book ${requestedId}:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteBookHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const deleted = await deleteBook(requestedId);

    if (!deleted) {
      return res.status(404).json({ message: 'Book not found' });
    }

    return res.status(204).send();
  } catch (err) {
    console.error(`Error deleting book ${requestedId}:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
