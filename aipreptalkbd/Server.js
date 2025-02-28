const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");

const app = express();

app.use(express.json());

const corsOptions = {
    origin: "http://localhost:3000",
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
};
app.use(cors(corsOptions));


mongoose.connect("mongodb://127.0.0.1:27017/aipreptalk")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch(err => console.error("MongoDB Connection Error:", err));

const userSchema = new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String
});

const User = mongoose.model("User", userSchema);

app.post("/api/auth/signup", async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use. Try logging in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.json({ message: "Login successful", user: { fullName: user.fullName, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

let storedResumes = [];

app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = path.join(__dirname, req.file.path);

        const loader = new PDFLoader(filePath, { splitPages: false });
        const docs = await loader.load();
        const pdfText = docs.map(doc => doc.pageContent).join("\n");

        storedResumes.push({ pdfText });

        console.log("Extracted Text:", pdfText);

        fs.unlinkSync(filePath);

        res.json({ message: "Resume uploaded and extracted successfully!", extractedText: pdfText });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

app.post("/api/chat", (req, res) => {
    const { message } = req.body;
    res.json({ response: `You said: ${message}` });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
