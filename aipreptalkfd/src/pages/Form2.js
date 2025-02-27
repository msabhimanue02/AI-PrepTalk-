import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Form2.css";

const Form2 = () => {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const navigate = useNavigate();

  const jobRoles = ["Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer", "Marketing Specialist"];

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      e.target.value = null;
      return;
    }
    setResume(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resume || !jobRole) {
      alert("Please fill out all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobRole", jobRole);

    try {
      await axios.post("http://localhost:5000/api/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Form submitted successfully!");
      navigate("/chat");
    } catch (error) {
      console.error("Error uploading resume:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.error || "Failed to submit form."}`);
      } else {
        alert("Failed to submit form. Please try again.");
      }
    }
  };

  return (
    <div className="form2-page">
      <div className="form-container">
        <div className="form-box">
          <h2>Upload Your Resume</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Upload Resume/CV:</label>
              <input type="file" accept=".pdf" onChange={handleResumeUpload} required />
              {resume && <div className="file-info"><p>{resume.name}</p></div>}
              <small style={{ color: "red" }}>(Only PDF format files are supported)</small>
            </div>
            <div className="form-group">
              <label>Job Role:</label>
              <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} required>
                <option value="">Select a job role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={!resume || !jobRole}>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form2;
