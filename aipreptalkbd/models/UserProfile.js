const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resume: { type: String, required: true },
    selectedJobTitle: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserProfile", userProfileSchema);
