import {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  authorHasBooks,
} from '../models/authors.js';
import {
  isNonEmptyString,
  isValidBirthYear,
  isDuplicateKeyError,
} from '../utils/validation.js';

const birthYearMessage = 'birthYear must be a whole number between 0 and the current year';

export const getAuthorsHandler = async (req, res) => {
  try {
    const authors = await getAllAuthors();
    return res.status(200).json(authors);
  } catch (err) {
    console.error('Error retrieving authors:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAuthorByIdHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const author = await getAuthorById(requestedId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(author);
  } catch (err) {
    console.error(`Error retrieving author ${requestedId}:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const createAuthorHandler = async (req, res) => {
  const { id, name, birthYear } = req.body ?? {};

  if (!isNonEmptyString(id) || !isNonEmptyString(name)) {
    return res.status(400).json({ message: 'id and name are required strings' });
  }
  if (!isValidBirthYear(birthYear)) {
    return res.status(400).json({ message: birthYearMessage });
  }

  // Build the document from known fields only so clients cannot add extra fields.
  const author = { id: id.trim(), name: name.trim(), birthYear };

  try {
    const createdAuthor = await createAuthor(author);
    return res.status(201).json(createdAuthor);
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return res.status(400).json({ message: 'An author with that id already exists' });
    }
    console.error('Error creating author:', err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateAuthorHandler = async (req, res) => {
  const requestedId = req.params.id;
  const { name, birthYear } = req.body ?? {};

  if (!isNonEmptyString(name)) {
    return res.status(400).json({ message: 'name is a required string' });
  }
  if (!isValidBirthYear(birthYear)) {
    return res.status(400).json({ message: birthYearMessage });
  }

  try {
    const updatedAuthor = await updateAuthor(requestedId, { name: name.trim(), birthYear });

    if (!updatedAuthor) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(updatedAuthor);
  } catch (err) {
    console.error(`Error updating author ${requestedId}:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteAuthorHandler = async (req, res) => {
  const requestedId = req.params.id;

  try {
    const author = await getAuthorById(requestedId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found' });
    }

    // Deleting an author with books would leave those books pointing to nothing.
    if (await authorHasBooks(requestedId)) {
      return res.status(409).json({ message: 'Author still has books and cannot be deleted' });
    }

    await deleteAuthor(requestedId);
    return res.status(204).send();
  } catch (err) {
    console.error(`Error deleting author ${requestedId}:`, err.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
