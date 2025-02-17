import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Form2.css";

const Form2 = () => {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [customJobRole, setCustomJobRole] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [customTimeLimit, setCustomTimeLimit] = useState("");

  const navigate = useNavigate(); // Hook for navigation

  const jobRoles = ["Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "Marketing Specialist"];
  const timeLimits = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      e.target.value = null; // Clear the file input
      return;
    }
    setResume(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ 
      resume, 
      jobRole: jobRole === "Other" ? customJobRole : jobRole, 
      timeLimit: timeLimit === "Other" ? customTimeLimit : timeLimit 
    });

    alert("Form submitted successfully!");
    navigate("/chat"); // Redirect to Chat page
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Upload Your Resume</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Resume/CV:</label>
            <input type="file" accept=".pdf" onChange={handleResumeUpload} required />
            <small style={{ color: "gray" }}>(Only PDF format files are supported)</small>
          </div>

          <div className="form-group">
            <label>Job Role:</label>
            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} required>
              <option value="">Select a job role</option>
              {jobRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {jobRole === "Other" && <input type="text" placeholder="Enter job role" onChange={(e) => setCustomJobRole(e.target.value)} required />}
          </div>

          <div className="form-group">
            <label>Interview Time Limit:</label>
            <select value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required>
              <option value="">Select time limit</option>
              {timeLimits.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {timeLimit === "Other" && <input type="text" placeholder="Enter time limit" onChange={(e) => setCustomTimeLimit(e.target.value)} required />}
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Form2;
