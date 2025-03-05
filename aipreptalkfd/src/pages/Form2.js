import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import Select from "react-select";
import "../styles/Form2.css";

const Form2 = () => {
  const [resume, setResume] = useState(null);
  const [jobRole, setJobRole] = useState(null);
  const [jobRoles, setJobRoles] = useState([]);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const fetchJobRoles = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/roles");
        setJobRoles(response.data.titles.map(role => ({ value: role, label: role })));
      } catch (error) {
        console.error("Error fetching job roles:", error);
      }
    };
    fetchJobRoles();
  }, []);

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
    formData.append("jobRole", jobRole.value);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="form2-page">
      <button onClick={handleLogout} className="logout-btn">Logout</button>
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
              <Select 
                options={jobRoles} 
                value={jobRole} 
                onChange={setJobRole} 
                placeholder="Search or select a job role" 
                isSearchable 
                required
              />
            </div>
            <button type="submit" disabled={!resume || !jobRole}>Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form2;
