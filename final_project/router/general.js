const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }
    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists." });
    }
    
    // Add user to users array
    users.push({ username, password });
    
    return res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const { isbn } = req.params;
    const filteredBooks = Object.values(books).find(book => book.isbn === isbn);

    if (filteredBooks) {
      return res.status(200).json(filteredBooks);
    }
    return res.status(404).json({ message: "Book not found." });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const { author } = req.params;
    const filteredBooks = Object.values(books).find(book => book.author.toLowerCase() === author.toLowerCase());
    if (filteredBooks) {
        return res.status(200).json(filteredBooks);
    }
    return res.status(404).json({ message: "No books found for this author." });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const { title } = req.params;
    const filteredBooks = Object.values(books).find(book => book.title.toLowerCase() === title.toLowerCase());
    if (filteredBooks) {
        return res.status(200).json(filteredBooks);
    }
    return res.status(404).json({ message: "No books found with this title." });
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;
    const filteredBooks = Object.values(books).find(book => book.isbn === isbn);
    if (filteredBooks) {
        return res.status(200).json(filteredBooks.reviews);
    }
    return res.status(404).json({ message: "No reviews found for this book." });
});

const getBookListAsync = async () => {
  try {
      const response = await axios.get('http://localhost:3000/');
      return response.data;
  } catch (error) {
      throw error;
  }
};

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
      axios.get(`http://localhost:3000/isbn/${isbn}`)
          .then(response => resolve(response.data))
          .catch(error => reject(error));
  });
};

const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
      axios.get(`http://localhost:3000/author/${author}`)
          .then(response => resolve(response.data))
          .catch(error => reject(error));
  });
};

const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
      axios.get(`http://localhost:3000/title/${title}`)
          .then(response => resolve(response.data))
          .catch(error => reject(error));
  });
};

module.exports.general = public_users;
// module.exports = { getBookByISBN, getBookListAsync, getBooksByAuthor, getBooksByTitle};
