const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const secretKey = 'your-secret-key';
let users = []; // Array to hold registered users

const isValid = (username) => { 
    return users.some(user => user.username === username); // Check if username is valid
}

const authenticatedUser = (username, password) => { 
    // Check if username and password match
    const user = users.find(user => user.username === username);
    return user ? user.password === password : false;
}

// Login endpoint
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username)) {
        return res.status(404).json({ message: "User not found." });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token and send response
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful.", token });
});

// Middleware to check if the user is authenticated
const checkAuthentication = (req, res, next) => {
  console.log(req.headers['authorization'])
  console.log("headers", req.headers)
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from header

  if (!token) {
      return res.status(401).json({ message: 'No token provided, please log in.' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
          return res.status(401).json({ message: 'Invalid token, please log in again.' });
      }
      req.user = decoded; // Store user info in the request object
      next(); // Proceed to the next middleware/route handler
  });
};

// Add or modify a book review
regd_users.put("/auth/review/:isbn", checkAuthentication, (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const username = req.user.username; // Get the username from the token
    console.log("username", username);

    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty." });
    }

    // Find the book by ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }
    console.log("book", book.reviews);
    // Add or update the review in the book's reviews
    book.reviews[username] = review;


    return res.status(200).json({ message: "Review added/updated successfully." });
});

// Get reviews for a book by ISBN
regd_users.get("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    // Find the book by ISBN
    const book = Object.values(books).find(book => {
      return book.isbn === String(req.params.isbn);
    });
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }
    return res.status(200).json(book.reviews);
});

// Delete a review for a book
regd_users.delete("/auth/review/:isbn", checkAuthentication, (req, res) => {
    const { isbn } = req.params;
    const username = req.user.username; // Get the username from the token

    // Find the book by ISBN
    const book = Object.values(books).find(book => book.isbn === isbn);
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }

    // Check if the review exists for the logged-in user
    if (!book.reviews[username]) {
        return res.status(404).json({ message: "Review not found for this book." });
    }

    // Delete the review
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
