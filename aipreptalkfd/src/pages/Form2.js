import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Form2.css";

const Form2 = () => {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [customJobRole, setCustomJobRole] = useState("");
  const [extractedText, setExtractedText] = useState(""); // Store extracted text temporarily
  const [storedJobRole, setStoredJobRole] = useState(""); // Store job role temporarily
  const navigate = useNavigate();

  const jobRoles = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "Marketing Specialist",
  ];

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

    const finalJobRole = jobRole === "Other" ? customJobRole : jobRole;

    if (!resume || !finalJobRole) {
      alert("Please fill out all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobRole", finalJobRole);

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Resume uploaded and processed successfully!");
        setExtractedText(data.text); // Store extracted text temporarily
        setStoredJobRole(finalJobRole); // Store job role temporarily
        console.log("Extracted Text:", data.text);
        console.log("Stored Job Role:", finalJobRole);
        navigate("/chat");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="form2-page">
      <div className="form-container">
        <div className="form-box">
          <h2>Upload Your Resume</h2>
          <form onSubmit={handleSubmit}>
            {/* Resume Upload */}
            <div className="form-group">
              <label>Upload Resume/CV:</label>
              <input type="file" accept=".pdf" onChange={handleResumeUpload} required />
              {resume && (
                <div className="file-info">
                  <p>{resume.name}</p>
                </div>
              )}
              <small style={{ color: "red" }}>(Only PDF format files are supported)</small>
            </div>

            {/* Job Role Selection */}
            <div className="form-group">
              <label>Job Role:</label>
              <select value={jobRole} onChange={(e) => setJobRole(e.target.value)} required>
                <option value="">Select a job role</option>
                {jobRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
                <option value="Other">Other</option>
              </select>
              {jobRole === "Other" && (
                <input 
                  type="text" 
                  placeholder="Enter job role" 
                  value={customJobRole} 
                  onChange={(e) => setCustomJobRole(e.target.value)} 
                  required 
                />
              )}
            </div>

            <button type="submit" disabled={!resume || !jobRole }>Submit</button>
          </form>

          {/* Display extracted text and stored job role */}
          {extractedText && (
     <div className="output">
     <h3>Extracted PDF Text:</h3>
     <p>{extractedText}</p> {/* Display full extracted text */}
     <h3>Stored Job Role:</h3>
     <p>{storedJobRole}</p>
     </div>
     )}
        </div>
      </div>
    </div>
  );
};

export default Form2;
