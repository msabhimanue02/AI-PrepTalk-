const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer"); // For file uploads
const pdfParse = require("pdf-parse"); // For extracting text from PDFs
const bcrypt = require("bcryptjs");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Set up Multer for file uploads (stores in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/aipreptalk")
    .then(() => console.log(" MongoDB Connected Successfully"))
    .catch(err => console.error(" MongoDB Connection Error:", err));

// Temporary storage for extracted text & job role
let extractedPdfText = "";
let storedJobRole = "";

// Resume Upload Route (Extracts text and stores job role temporarily)
app.post("/api/upload", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const textData = await pdfParse(req.file.buffer);
        extractedPdfText = textData.text; // Store extracted PDF text
        storedJobRole = req.body.jobRole; // Store job role

        res.json({ message: "PDF processed successfully", text: extractedPdfText, jobRole: storedJobRole });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ message: "Failed to process PDF", error });
    }
});

// API to retrieve temporarily stored data
app.get("/api/temp-data", (req, res) => {
    res.json({ extractedText: extractedPdfText, jobRole: storedJobRole });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
