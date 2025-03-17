const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    active: { type: Boolean, default: true }
});

module.exports = mongoose.model("Job", jobSchema);
