# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

### Goal
Add an `authors` collection and an API that supports all CRUD operations for authors. Books reference authors by id, so the author API must protect that relationship. Every author route must be documented and testable in Swagger.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, custom id such as `a1`
- `name`: string, required
- `birthYear`: number, required

Authors will use custom string ids instead of MongoDB `_id` values for route parameters, the same as books.

### Relationship to Books
A book's `authorId` points to an author's `id`. An author who still has books cannot be deleted, because that would leave books pointing to an author that no longer exists.

### Routes

#### GET /authors
Purpose: Return all authors.

Success:
- Status code: `200`
- Response body: an array of author objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by its custom id.

Success:
- Status code: `200`
- Response body: the matching author object

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:

    {
      "id": "a4",
      "name": "Example Author",
      "birthYear": 1980
    }

Success:
- Status code: `201`
- Response body: the newly created author object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:

    {
      "name": "Updated Author",
      "birthYear": 1981
    }

Success:
- Status code: `200`
- Response body: the updated author object

Errors:
- `400` if a required field is missing
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /authors/:id
Purpose: Delete an existing author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no author exists with that id
- `409` if the author still has books
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every author route.

### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

---

## Spec Evaluation

Questions asked of Version 1:

1. Are there any bugs or short-sighted decisions in this specification?
2. Are there any security considerations that are missing?
3. Are there any efficiency concerns with the current endpoint design?
4. Are any response examples or error behaviors unclear?

Findings:

- **Field types are not checked.** "Required" only says the field must be present. `"birthYear": "abc"` or `"title": 42` would be accepted and stored. Version 2 adds type rules for every field.
- **Extra fields are not addressed.** If the controller writes `req.body` straight to MongoDB, a client can add any field it wants, including `_id`. Version 2 only stores the documented fields.
- **The `id` in a PUT body is not addressed.** A client could send an `id` in the body that differs from the URL. Version 2 says the URL id is always used and the id cannot be changed.
- **Duplicate ids have a race condition.** Checking "does this id exist?" and then inserting can let two requests with the same id both succeed. Version 2 adds a unique index on `id` in both collections, and a duplicate key error returns `400`.
- **Raw database errors could leak.** Version 1 says `500` but not what the body contains. Version 2 requires a safe, general JSON message and server-side logging only.
- **MongoDB `_id` is exposed.** Responses would include the internal `_id`. Version 2 removes `_id` from every response, as in Week 01.
- **Malformed JSON is not covered.** A request body that is not valid JSON would fall through to the default Express error page. Version 2 returns `400` with a JSON message.
- **Checking whether an author has books scans the collection.** `DELETE /authors/:id` counts books by `authorId`. Version 2 adds an index on `books.authorId` so that lookup stays fast as the collection grows.
- **Error bodies have no examples.** Version 1 lists status codes but not response bodies. Version 2 gives an exact JSON message for each error.
- **`publicationDate` has no format.** Version 2 requires `YYYY-MM-DD`.

---

# Books API Week 02 Spec - Version 2

## Shared Rules

These rules apply to every book and author route.

- Custom string ids (`b1`, `a1`) are used in routes. MongoDB `_id` is never accepted from clients and never returned in responses.
- Only the documented fields are stored. Any other fields in a request body are ignored.
- String fields must be non-empty strings. Leading and trailing spaces are trimmed before saving.
- On `PUT`, the id comes from the URL. An `id` in the request body is ignored, so ids cannot be changed.
- The `id` field has a unique index in both collections. If two requests try to create the same id, the second one gets `400`.
- Every error response is JSON in the form `{ "message": "..." }`.
- Unexpected errors are logged on the server. The client only receives a general message, never database details.
- A request body that is not valid JSON returns `400` with `{ "message": "Request body must be valid JSON" }`.
- Successful responses use `Content-Type: application/json`, except `204` responses, which have no body.

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents are stored in the `books` collection.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Required on create. Non-empty. Unique. |
| `authorId` | string | Required. Must match the `id` of an existing author. |
| `title` | string | Required. Non-empty. |
| `publicationDate` | string | Required. Format `YYYY-MM-DD` and a real calendar date. |

Example book:

    {
      "id": "b1",
      "authorId": "a1",
      "title": "Patterns of Light",
      "publicationDate": "2021-08-17"
    }

The Week 01 `author` name field is replaced by `authorId`. Existing books `b1`, `b2`, and `b3` will be updated to reference authors `a1`, `a2`, and `a3`, and the old `author` field will be removed.

Indexes:
- Unique index on `books.id`
- Index on `books.authorId`, used when checking whether an author has books

### Relationship to Authors
`books.authorId` points to `authors.id`. The book stores only the author id, not a copy of the author.

When creating or updating a book, the API rejects the request with `400` if `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books, sorted by `id`.

Success:
- `200` with an array of book objects (an empty array if there are no books)

Errors:
- `500` with `{ "message": "Internal server error" }`

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- `200` with the matching book object

Errors:
- `404` with `{ "message": "Book not found" }`
- `500` with `{ "message": "Internal server error" }`

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- `201` with the newly created book object

Errors (checked in this order):
- `400` with `{ "message": "id, authorId, title, and publicationDate are required strings" }` if a field is missing, empty, or not a string
- `400` with `{ "message": "publicationDate must use the format YYYY-MM-DD" }` if the date is not valid
- `400` with `{ "message": "Author not found for authorId" }` if `authorId` does not match an existing author
- `400` with `{ "message": "A book with that id already exists" }` if the `id` is already used
- `500` with `{ "message": "Internal server error" }`

#### PUT /books/:id
Purpose: Replace the editable fields of an existing book.

Request body (all fields required):

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- `200` with the updated book object

Errors (checked in this order):
- `400` with `{ "message": "authorId, title, and publicationDate are required strings" }` if a field is missing, empty, or not a string
- `400` with `{ "message": "publicationDate must use the format YYYY-MM-DD" }` if the date is not valid
- `404` with `{ "message": "Book not found" }` if no book exists with that id
- `400` with `{ "message": "Author not found for authorId" }` if `authorId` does not match an existing author
- `500` with `{ "message": "Internal server error" }`

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- `204` with no response body

Errors:
- `404` with `{ "message": "Book not found" }`
- `500` with `{ "message": "Internal server error" }`

### Swagger Documentation
- Every book route is documented at `/api-docs` under the **Books** tag.
- `POST` and `PUT` include a `requestBody` with the schema and an example, so they can be run from the browser.
- Every status code the controller returns is listed in the route's documented responses.
- A shared `Book` schema includes `authorId`.

### Deployment Expectations
The book routes must work locally and on the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

### Goal
Add an `authors` collection and an API that supports all CRUD operations for authors, while protecting the book-to-author relationship. Every author route must be documented and testable in Swagger.

### Data Model
Author documents are stored in the `authors` collection.

| Field | Type | Rules |
| --- | --- | --- |
| `id` | string | Required on create. Non-empty. Unique. |
| `name` | string | Required. Non-empty. |
| `birthYear` | integer | Required. Between 0 and the current year. |

Example author:

    {
      "id": "a1",
      "name": "Maya Rivera",
      "birthYear": 1984
    }

Initial data: authors `a1`, `a2`, and `a3`, matching the author names used by the Week 01 books.

Indexes:
- Unique index on `authors.id`

### Relationship to Books
An author cannot be deleted while any book still has that author's id as its `authorId`. The client must delete those books or move them to another author first. This prevents books from pointing to an author that does not exist.

### Routes

#### GET /authors
Purpose: Return all authors, sorted by `id`.

Success:
- `200` with an array of author objects (an empty array if there are no authors)

Errors:
- `500` with `{ "message": "Internal server error" }`

#### GET /authors/:id
Purpose: Return one author by its custom id.

Success:
- `200` with the matching author object

Errors:
- `404` with `{ "message": "Author not found" }`
- `500` with `{ "message": "Internal server error" }`

#### POST /authors
Purpose: Create a new author.

Request body:

    {
      "id": "a4",
      "name": "Example Author",
      "birthYear": 1980
    }

Success:
- `201` with the newly created author object

Errors (checked in this order):
- `400` with `{ "message": "id and name are required strings" }` if either is missing, empty, or not a string
- `400` with `{ "message": "birthYear must be a whole number between 0 and the current year" }` if `birthYear` is missing or invalid
- `400` with `{ "message": "An author with that id already exists" }` if the `id` is already used
- `500` with `{ "message": "Internal server error" }`

#### PUT /authors/:id
Purpose: Replace the editable fields of an existing author.

Request body (all fields required):

    {
      "name": "Updated Author",
      "birthYear": 1981
    }

Success:
- `200` with the updated author object

Errors (checked in this order):
- `400` with `{ "message": "name is a required string" }` if `name` is missing, empty, or not a string
- `400` with `{ "message": "birthYear must be a whole number between 0 and the current year" }` if `birthYear` is missing or invalid
- `404` with `{ "message": "Author not found" }` if no author exists with that id
- `500` with `{ "message": "Internal server error" }`

#### DELETE /authors/:id
Purpose: Delete an existing author who has no books.

Success:
- `204` with no response body

Errors:
- `404` with `{ "message": "Author not found" }`
- `409` with `{ "message": "Author still has books and cannot be deleted" }` if any book has this `authorId`
- `500` with `{ "message": "Internal server error" }`

`409 Conflict` is used instead of `400` because the request itself is valid. It conflicts with the current state of the data, and it would succeed once the author's books are removed.

### Swagger Documentation
- Every author route is documented at `/api-docs` under the **Authors** tag.
- `POST` and `PUT` include a `requestBody` with the schema and an example, so they can be run from the browser.
- Every status code the controller returns is listed in the route's documented responses.
- A shared `Author` schema is defined.

### Deployment Expectations
The author routes must work locally and on the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.
