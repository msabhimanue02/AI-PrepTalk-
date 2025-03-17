const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const Job = require("./models/Job");
const UserProfile = require("./models/UserProfile");
const app = express();

app.use(express.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
    origin: "http://localhost:3000",
    methods: "GET,POST",
    credentials: true,
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

// Passport Configuration
passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Invalid email or password' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

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

        req.login(newUser, (err) => {
            if (err) {
                return res.status(500).json({ message: "Error logging in after signup", error: err });
            }
            res.status(201).json({ message: "User registered successfully", user: { fullName: newUser.fullName, email: newUser.email } });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

app.post("/api/auth/login", passport.authenticate('local'), (req, res) => {
    res.json({ 
        message: "Login successful", 
        user: { 
            fullName: req.user.fullName, 
            email: req.user.email 
        } 
    });
});

app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Error logging out", error: err });
        }
        res.json({ message: "Logged out successfully" });
    });
});

// Protected route example
app.get("/api/auth/user", isAuthenticated, (req, res) => {
    res.json({ user: { fullName: req.user.fullName, email: req.user.email } });
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

app.post("/api/upload-resume", isAuthenticated, upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = path.join(__dirname, req.file.path);
        const jobRole = req.body.jobRole;

        const loader = new PDFLoader(filePath, { splitPages: false });
        const docs = await loader.load();
        const pdfText = docs.map(doc => doc.pageContent).join("\n");

        // Create or update user profile
        await UserProfile.findOneAndUpdate(
            { userId: req.user._id },
            { 
                userId: req.user._id,
                resume: pdfText,
                selectedJobTitle: jobRole
            },
            { upsert: true, new: true }
        );

        fs.unlinkSync(filePath);

        res.json({ message: "Resume uploaded and profile updated successfully!" });
    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

app.post("/api/chat", (req, res) => {
    const { message } = req.body;
    res.json({ response: `You said: ${message}` });
});

// Get all records from jobs collection with active=true
// Return titles as an array
app.get("/api/roles", async (req, res) => {
    try {
        const jobs = await mongoose.connection.db.collection("jobs")
            .find({ active: true })
            .project({ title: 1, _id: 0 }) // Select only the 'title' field
            .toArray();

        const jobTitles = jobs.map(job => job.title);

        res.json({ titles: jobTitles });
    } catch (error) {
        console.error("Error fetching job titles:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get job description for a specific title
app.get("/api/job-description/:title", isAuthenticated, async (req, res) => {
    try {
        const job = await Job.findOne({ title: req.params.title, active: true });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.json({ description: job.description });
    } catch (error) {
        console.error("Error fetching job description:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Get user profile data
app.get("/api/user-profile", isAuthenticated, async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        res.json(profile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
});

const interviewRoutes = require("./routes/interview");
app.use("/api/interview", interviewRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});