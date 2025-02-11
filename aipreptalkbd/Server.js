const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Temporary storage for users (resets when server restarts)
const users = [];

// Signup Route
app.post("/api/auth/signup", (req, res) => {
  const { fullName, email, password } = req.body;

  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    return res.status(400).json({ message: "Email already in use. Try logging in." });
  }

  // Store new user
  users.push({ fullName, email, password });
  res.status(201).json({ message: "User registered successfully" });
});

// Login Route
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = users.find((user) => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({ message: "Login successful", user: { fullName: user.fullName, email: user.email } });
});

// Chat Route (Placeholder)
app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  res.json({ response: `You said: ${message}` });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
