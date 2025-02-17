import React from "react";
import { Link } from "react-router-dom";
import "../styles/Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar" aria-label="Main Navigation">
        <div className="logo-text">AI-PrepTalk</div>
        <div className="nav-links">
          <Link to="/about" className="nav-btn" aria-label="About page">About</Link>
          <Link to="/signup" className="nav-btn" aria-label="Sign up page">Sign Up</Link>
          <Link to="/login" className="nav-btn" aria-label="Sign in page">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="text-content">
          <h1>Practice, Prepare, and Ace Your Interview</h1>
          <p>
            AI-PrepTalk provides AI-driven mock interviews tailored to your job role and experience level.
            Get real-time feedback, track your progress, and boost your confidence.
          </p>
          <Link to="/signup" className="cta-btn">Get Started</Link>
        </div>
        <div className="image-container">
          <img src="/images/slo.jpg" alt="AI Interview Mockup" className="hero-image" />
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="feature-card">
          <h3>AI-Powered Interviews</h3>
          <p>Simulate real interviews with AI-generated questions and responses.</p>
        </div>
        <div className="feature-card">
          <h3>Personalized Feedback</h3>
          <p>Receive instant feedback to improve your answers and confidence.</p>
        </div>
        <div className="feature-card">
          <h3>Track Your Progress</h3>
          <p>Monitor improvements over time with detailed analytics.</p>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <p>© 2025 AI-PrepTalk. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
