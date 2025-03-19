require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { SystemMessage, HumanMessage, AIMessage } = require("@langchain/core/messages");
const { StateGraph, MemorySaver, MessagesAnnotation } = require("@langchain/langgraph");
const mongoose = require("mongoose");
const UserProfile = require("../models/UserProfile");
const Job = require("../models/Job");
const ChatHistory = require("../models/ChatHistory");
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
  const lastMessage = state.messages[state.messages.length - 1];
  const questionCount = state.messages.filter(msg => msg instanceof AIMessage).length;
  let prompt = "";
  
  // If it's the first message, include the system message
  if (state.messages.length > 1 && state.messages[0] instanceof SystemMessage) {
    const systemMessage = state.messages[0];
    prompt = `${systemMessage.content}\n\nCurrent conversation:\n`;
  }
  
  // Add the last 2-3 messages for context (if they exist)
  const contextMessages = state.messages
    .slice(-3) // Get last 3 messages
    .filter(msg => !(msg instanceof SystemMessage)) // Exclude system message
    .map(msg => `${msg.role === 'human' ? 'User' : 'AI'}: ${msg.content}`)
    .join('\n');
  
  prompt += contextMessages;

  // Add question count context and request feedback if needed
  prompt += `\n\nCurrent question number: ${questionCount + 1}`;
  
  if (questionCount >= 10) {
    prompt += "\n\nNote: The interview should conclude soon. If this is an appropriate point to end (max 20 questions), " +
      "provide a comprehensive feedback summary including:\n" +
      "1. Overall interview performance\n" +
      "2. Key strengths demonstrated\n" +
      "3. Areas for improvement\n" +
      "4. Final recommendations\n" +
      "Then end with 'INTERVIEW_COMPLETE'";
  }
  
  // Generate the response
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const responseText = response.text();
  
  // Check if interview is complete
  const isComplete = responseText.includes('INTERVIEW_COMPLETE');
  
  if (isComplete) {
    // Remove the INTERVIEW_COMPLETE marker from the response
    const cleanResponse = responseText.replace('INTERVIEW_COMPLETE', '').trim();
    return { 
      messages: [new AIMessage(cleanResponse)],
      interview_complete: true 
    };
  }
  
  return { messages: [new AIMessage(responseText)] };
}

// Setup LangGraph workflow
const graphBuilder = new StateGraph(MessagesAnnotation)
  .addNode("generateResponse", generateResponse)
  .addEdge("__start__", "generateResponse")
  .addEdge("generateResponse", "__end__");

const checkpointer = new MemorySaver();
const graphWithMemory = graphBuilder.compile({ checkpointer });

// API Route for Interview Start
// API Route for Interview Start
router.post("/start", isAuthenticated, async (req, res) => {
  try {
    const { userMessage } = req.body;

    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get or create chat history
    let chatHistory = await ChatHistory.findOne({ 
      userId: req.user._id,
      isComplete: false
    });

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

    // If no active chat history, create new one
    if (!chatHistory) {
      chatHistory = new ChatHistory({
        userId: req.user._id,
        jobRole: profile.selectedJobTitle
      });
    }

    // Fetch system message from MongoDB
    const systemMessageDoc = await SystemPrompt.findOne();
    if (!systemMessageDoc) {
      return res.status(500).json({ error: "System message not found. Please contact support." });
    }

    // Replace placeholders in the system message
    let personalizedSystemMessage = systemMessageDoc.message
      .replace("${req.user.fullName}", req.user.fullName)
      .replace("${profile.selectedJobTitle}", profile.selectedJobTitle)
      .replace("${job.description}", job.description)
      .replace("${profile.resume}", profile.resume || "Resume not provided.");

    // Initialize messages array with just the current message
    let messages = [new HumanMessage(userMessage)];

    // Save user message to chat history
    chatHistory.messages.push({
      role: 'human',
      content: userMessage
    });

    // Only add system message for the first message in a conversation
    const uniqueThreadId = `${req.sessionID}_${Date.now()}`;
    const isFirstMessage = !req.session.hasStartedInterview;
    
    if (isFirstMessage) {
      messages.unshift(new SystemMessage(personalizedSystemMessage));
      chatHistory.messages.unshift({
        role: 'system',
        content: personalizedSystemMessage
      });
      req.session.hasStartedInterview = true;
      req.session.threadId = uniqueThreadId;
    }
    
    let threadConfig = { 
      configurable: { 
        thread_id: req.session.threadId || uniqueThreadId 
      }, 
      streamMode: "values" 
    };
    
    let responseMessage = "";
    let isInterviewComplete = false;

    console.log("AI Response:", responseMessage);
    console.log("Interview Complete:", isInterviewComplete);

    for await (const step of await graphWithMemory.stream({ messages }, threadConfig)) {
      const lastMessage = step.messages[step.messages.length - 1];
      if (lastMessage instanceof AIMessage) {
        responseMessage = lastMessage.content;
        isInterviewComplete = step.interview_complete || false;

        // Log AI response
        console.log("AI Response:", responseMessage);
        console.log("Interview Complete:", isInterviewComplete);
        
        break;
      }
    }

    // Save AI response to chat history
    chatHistory.messages.push({
      role: 'ai',
      content: responseMessage
    });

    // If interview is complete, update chat history
    if (isInterviewComplete) {
      chatHistory.isComplete = true;
      chatHistory.completedAt = new Date();
    }

    try {
      await ChatHistory.findOneAndUpdate(
        { _id: chatHistory._id },
        { 
          $set: {
            messages: chatHistory.messages,
            isComplete: chatHistory.isComplete,
            completedAt: chatHistory.completedAt
          }
        },
        { 
          new: true,
          upsert: true // Create if doesn't exist
        }
      );
    } catch (error) {
      console.error("Error saving chat history:", error);
      // Create new chat history if update fails
      if (error.message.includes("No matching document found")) {
        const newChatHistory = new ChatHistory({
          userId: req.user._id,
          jobRole: profile.selectedJobTitle,
          messages: chatHistory.messages,
          isComplete: chatHistory.isComplete,
          completedAt: chatHistory.completedAt
        });
        await newChatHistory.save();
      } else {
        throw error;
      }
    }

    res.json({ 
      aiResponse: responseMessage,
      interviewComplete: isInterviewComplete 
    });
  } catch (error) {
    console.error("Error during interview:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
});

// Add endpoint to get selected role
router.get('/selected-role', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await UserProfile.findOne({ userId: req.session.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ role: user.selectedJobTitle || '' });
  } catch (error) {
    console.error('Error fetching selected role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history for user
router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const chatHistories = await ChatHistory.find({ 
      userId: req.user._id 
    }).sort({ startedAt: -1 });

    res.json(chatHistories);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

module.exports = router;
