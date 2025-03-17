require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");
const { StateGraph, MemorySaver, MessagesAnnotation } = require("@langchain/langgraph");
const mongoose = require("mongoose");
const UserProfile = require("../models/UserProfile");
const Job = require("../models/Job");
const router = express.Router();

// Define SystemPrompt Model
const SystemPrompt = mongoose.model(
  "SystemPrompt",
  new mongoose.Schema({
    role: String,
    message: String,
  }),
  "systemprompt" // Collection name
);

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized - Please log in first" });
};

// AI Response Function
async function generateResponse(state) {
  const conversationText = state.messages.map((msg) => msg.content).join("\n");
  const result = await model.generateContent(conversationText);
  const response = await result.response;
  return { messages: [new AIMessage(response.text())] };
}

// Setup LangGraph workflow
const graphBuilder = new StateGraph(MessagesAnnotation)
  .addNode("generateResponse", generateResponse)
  .addEdge("__start__", "generateResponse")
  .addEdge("generateResponse", "__end__");

const checkpointer = new MemorySaver();
const graphWithMemory = graphBuilder.compile({ checkpointer });

// API Route for Interview Start
router.post("/start", isAuthenticated, async (req, res) => {
  try {
    const { userMessage, chatHistory } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch system message from MongoDB
    const systemMessageDoc = await SystemPrompt.findOne();
    if (!systemMessageDoc) {
      return res.status(500).json({ error: "System message not found. Please contact support." });
    }

    // Get user profile data
    const profile = await UserProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(400).json({ error: "Please upload your resume and select a job role first" });
    }

    // Get job description
    const job = await Job.findOne({ title: profile.selectedJobTitle, active: true });
    if (!job) {
      return res.status(400).json({ error: "Selected job role not found" });
    }

    // Replace placeholders in the system message
    let personalizedSystemMessage = systemMessageDoc.message
      .replace("${req.user.fullName}", req.user.fullName)
      .replace("${profile.selectedJobTitle}", profile.selectedJobTitle)
      .replace("${job.description}", job.description)
      .replace("${profile.resume}", profile.resume || "Resume not provided.");

    // Prepare conversation messages
    let messages = chatHistory.map(msg => msg.role === "human" 
      ? new HumanMessage(msg.content) 
      : new AIMessage(msg.content)
    );

    if (messages.length === 0) {
      messages.push(new SystemMessage(personalizedSystemMessage));
    }

    messages.push(new HumanMessage(userMessage));

    let threadConfig = { configurable: { thread_id: "abc123" }, streamMode: "values" };
    let responseMessage = "";

    for await (const step of await graphWithMemory.stream({ messages }, threadConfig)) {
      const lastMessage = step.messages[step.messages.length - 1];
      if (lastMessage instanceof AIMessage) {
        responseMessage = lastMessage.content;
        break;
      }
    }

    res.json({ aiResponse: responseMessage });
  } catch (error) {
    console.error("Error during interview:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

module.exports = router;
