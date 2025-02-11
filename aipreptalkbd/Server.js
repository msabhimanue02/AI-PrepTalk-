const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = 5000;
const JWT_SECRET = "your_jwt_secret"; // Hardcoded for simplicity (change in production)

app.use(cors());
app.use(express.json());

// Temporary user storage (resets when the server restarts)
let users = [];

// Signup Route
app.post("/signup", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the email is already registered
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Store user details
    users.push({ fullName, email, password: hashedPassword });
    
    res.status(201).json({ message: "Signup successful!" });
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    
    res.status(200).json({ message: "Login successful!", token });
});

// Get Users Route (For testing purposes)
app.get("/users", (req, res) => {
    res.json(users);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
