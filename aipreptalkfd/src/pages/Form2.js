import React, { useState } from "react";
import "../styles/Form2.css";

const Form2 = () => {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [customJobRole, setCustomJobRole] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [customTimeLimit, setCustomTimeLimit] = useState("");

  const jobRoles = ["Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "Marketing Specialist"];
  const timeLimits = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];

  const handleResumeUpload = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ resume, jobRole: jobRole === "Other" ? customJobRole : jobRole, timeLimit: timeLimit === "Other" ? customTimeLimit : timeLimit });
    alert("Form submitted successfully!");
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Upload Your Resume</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Upload Resume/CV:</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} required />
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
