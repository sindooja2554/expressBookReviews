const express = require('express');
const jwt = require('jsonwebtoken');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Middleware to check JWT authentication for /customer/auth/* routes
app.use("/customer/auth/*", function auth(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token from the Authorization header

    if (!token) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }

    jwt.verify(token, 'your-secret-key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token, please log in again." });
        }
        req.user = decoded; // Store user info in the request object
        next(); // Proceed to the next middleware/route handler
    });
});

const PORT = 5001;

app.use("/customer", customer_routes); // Use customer routes for authenticated routes
app.use("/", genl_routes); // Use general routes for public access

app.listen(PORT, () => console.log("Server is running"));
