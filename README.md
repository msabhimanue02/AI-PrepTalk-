# AI-PrepTalk
An AI-powered mock interview system that analyzes resumes, generates job-specific questions, and provides feedback on user responses.

# Project Overview
AI-PrepTalk is an intelligent mock interview platform designed to help job seekers improve their interview skills. The system generates dynamic interview questions based on job roles, provides real-time feedback, and helps users track their progress.

# Features
📌 **User Authentication**
- Secure signup and login
- Session management with express-session and mongo
- Protected routes with passport authentication

📌 **AI-Powered Interviews**
- Dynamic interview questions using Google's Generative AI
- Context-aware follow-up questions based on previous responses
- Structured interview flow with LangChain and LangGraph
- Maximum 15 questions per interview session

📌 **Resume Processing**
- PDF resume parsing and analysis
- Skill extraction and job role matching
- Customized questions based on candidate experience

📌 **Real-time Feedback**
- Immediate response evaluation
- Detailed performance metrics
- Areas for improvement suggestions
- Interview completion summary

# Tech Stack
📌 **Frontend (aipreptalkfd)**
- React.js for UI components
- Protected routing with React Router
- Modern responsive design

📌 **Backend (aipreptalkbd)**
- Node.js & Express.js server
- MongoDB for data storage
- Passport.js authentication
- Google Generative AI integration
- LangChain for conversation management

📌 **Key Dependencies**
- @google/generative-ai: ^0.24.0
- @langchain/core: ^0.3.42
- @langchain/langgraph: ^0.2.54
- express: ^4.21.2
- mongoose: ^8.10.0
- passport: ^0.7.0
- pdf-parse: ^1.1.1

# Installation & Setup
1. **Prerequisites**
   ```bash
   - Node.js (v14 or higher)
   - MongoDB (v4.4 or higher)
   - Google AI API key
   ```

2. **Backend Setup**
   ```bash
   cd aipreptalkbd
   npm install
   # Create .env file with:
   # GOOGLE_API_KEY=your_google_ai_api_key
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd aipreptalkfd
   npm install
   npm start
   ```


