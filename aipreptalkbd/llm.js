require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {SystemMessage,HumanMessage,AIMessage,} = require("@langchain/core/messages");
const readline = require("readline-sync");
const { StateGraph } = require("@langchain/langgraph");
const { MemorySaver } = require("@langchain/langgraph");
const { MessagesAnnotation } = require("@langchain/langgraph");

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

console.log("AI-PrepTalk Mock Interview Started!");

// Define System Message
const systemMessageContent =  `You are a highly professional and experienced AI Interviewer for AI-PrepTalk. 
Your role is to conduct structured, insightful, and engaging interviews tailored to the candidate's background and job requirements.

1. Interview Structure 
   - Ask one question at a time and wait for the candidate's response.
   - Keep the conversation structured, clear, and professional.
   - Focus on both technical and behavioral questions.
   - Provide brief feedback after each answer.
   - Ask follow-up questions when appropriate to assess depth of understanding.
   - Conclude the interview after **approximately 5 main questions**.

2. Candidate Information
   - Candidate Name: John W. Smith
   - Job Title: Nurse
   - Job Description: A Nurse provides medical care and support to patients in hospitals, clinics, or homes. They monitor vital signs, administer medications, assist doctors in treatments, and educate patients about health management. Their role is crucial in ensuring patient recovery and comfort.
      - Candidate Resume:  
John W. Smith  
2002 Front Range Way Fort Collins, CO 80525  
jwsmith@colostate.edu 
 
Career Summary 
 
Four years experience in early childhood development with a diverse background in the care of 
special needs children and adults.


Adult Care Experience

• Determined work placement for 150 special needs adult clients.
• Maintained client databases and records.
• Coordinated client contact with local health care professionals on a monthly basis.
• Managed 25 volunteer workers.

Childcare Experience

• Coordinated service assignments for 20 part-time counselors and 100 client families.
• Oversaw daily activity and outing planning for 100 clients.
• Assisted families of special needs clients with researching financial assistance and
healthcare.
• Assisted teachers with managing daily classroom activities.
• Oversaw daily and special student activities.

Employment History

1999-2002 Counseling Supervisor, The Wesley Center, Little Rock, Arkansas.
1997-1999 Client Specialist, Rainbow Special Care Center, Little Rock, Arkansas
1996-1997 Teacher’s Assistant, Cowell Elementary, Conway, Arkansas

Education

University of Arkansas at Little Rock, Little Rock, AR

• BS in Early Childhood Development (1999)
• BA in Elementary Education (1998)
• GPA (4.0 Scale):  Early Childhood Development – 3.8, Elementary Education – 3.5,
Overall 3.4.
• Dean’s List, Chancellor’s List
3. Question Types
   - Technical questions about nursing procedures.
   - Patient care scenarios.
   - Emergency situation handling.
   - Team collaboration examples.
   - Ethical decision-making.

4. Evaluation Criteria
   - Clinical knowledge.
   - Problem-solving abilities.
   - Communication skills.
   - Patient care approach.
   - Professional ethics.

Remember to:
- Be professional but supportive.
- Ask follow-up questions when needed.
- Provide constructive feedback.
- Keep the interview engaging.
- End the interview naturally after around **5 main questions**, including follow-ups.
- After the interview, provide a **performance review** assessing strengths, weaknesses, and areas for improvement.

Please start with a warm welcome and your first question.`;

// Define the AI response function
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

// Conduct the interview interactively
async function conductInterview() {
  console.log("\nStarting your interview. Type your responses and press Enter.\n");

  let messages = [new SystemMessage(systemMessageContent)];
  let threadConfig = { configurable: { thread_id: "abc123" }, streamMode: "values" };
  let questionCount = 0;  // Track the number of main questions
  let interviewOngoing = true;

  while (interviewOngoing) {
    try {
      let inputs = { messages };

      for await (const step of await graphWithMemory.stream(inputs, threadConfig)) {
        const lastMessage = step.messages[step.messages.length - 1];

        if (lastMessage instanceof AIMessage) {
          console.log("\nInterviewer:", lastMessage.content);
          
          // Count only main questions (not follow-ups)
          if (!lastMessage.content.toLowerCase().includes("follow-up")) {
            questionCount++;
          }

          // End interview after 5 main questions
          if (questionCount >= 15) {
            console.log("\nInterviewer: This concludes our interview. Thank you for your time.");
            interviewOngoing = false;
            break;
          }
        }

        messages.push(lastMessage);
      }

      if (!interviewOngoing) break; // Exit loop if AI decides to end the interview

      const userInput = readline.question("\nYour answer: ");
      if (userInput.toLowerCase() === "exit") {
        console.log("\nInterview session ended. Thank you for participating!");
        return;
      }

      messages.push(new HumanMessage(userInput));
    } catch (error) {
      console.error("Error during interview:", error);
      const continueInterview = readline.question("There was an error. Continue? (yes/no): ").toLowerCase();
      if (continueInterview !== "yes") return;
    }
  }

  // **Generate Performance Feedback**
  console.log("\nGenerating performance feedback...");

  const feedbackPrompt = `
    Based on the candidate's responses in this mock interview, provide a performance review.
    - Highlight strengths and weaknesses.
    - Assess clinical knowledge, problem-solving, communication skills, and professionalism.
    - Offer constructive feedback for improvement.
    - End with words of encouragement.
  `;

  messages.push(new SystemMessage(feedbackPrompt));
  
  let feedbackInputs = { messages };
  for await (const step of await graphWithMemory.stream(feedbackInputs, threadConfig)) {
    const feedbackMessage = step.messages[step.messages.length - 1];
    
    if (feedbackMessage instanceof AIMessage) {
      console.log("\nPerformance Feedback:", feedbackMessage.content);
      break; // Only need the AI’s first response for feedback
    }
  }

  console.log("\nMock interview completed. Thank you for participating!");
}

// Start the interview
conductInterview();
