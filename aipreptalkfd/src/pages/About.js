import React from "react";
import "../styles/About.css"; // Make sure to create this CSS file

const About = () => {
  return (
    <div className="about-container">
      <h1>About AI-PrepTalk</h1>
      <p>
        AI-PrepTalk is an AI-powered mock interview platform designed to help job seekers
        enhance their interview skills. Whether you're an entry-level candidate or a seasoned
        professional, our platform provides personalized interview experiences to boost your confidence.
      </p>

      <h2>Our Features</h2>
      <ul>
        <li>📌 AI-driven mock interviews with real-time feedback</li>
        <li>📌 Adaptive difficulty levels: Entry, Mid, and Senior</li>
        <li>📌 Resume-based question customization</li>
        <li>📌 Interactive follow-up questions</li>
        <li>📌 Performance analysis with improvement suggestions</li>
        <li>📌 Track progress over multiple interview sessions</li>
      </ul>

      <h2>Why Choose AI-PrepTalk?</h2>
      <p>
        We understand that interviews can be challenging. AI-PrepTalk helps you practice in a realistic
        setting, refine your answers, and build confidence before stepping into a real interview.
      </p>

      <p>Start preparing today and ace your next interview with AI-PrepTalk! 🚀</p>
    </div>
  );
};

export default About;
