import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Home.css";

const Home = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar" aria-label="Main Navigation">
        <div className="logo-text">AI-PrepTalk</div>
        <div className="nav-links">
        <Link to="/" className="nav-btn" aria-label="Admin Dashboard">Admin</Link>
          <Link to="/about" className="nav-btn" aria-label="About page">About</Link>
          {user ? (
            <>
              <Link to="/Form2" className="nav-btn">Prev</Link>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
          ) : (
            <>
              <Link to="/signup" className="nav-btn" aria-label="Sign up page">Sign Up</Link>
              <Link to="/login" className="nav-btn" aria-label="Sign in page">Sign In</Link>
            </>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
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
      </main>
    </div>
  );
};

export default Home;
