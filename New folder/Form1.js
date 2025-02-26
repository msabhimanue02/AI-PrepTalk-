import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import "../styles/Form1.css";

const Form1 = () => {
  const [careerStage, setCareerStage] = useState("");
  const navigate = useNavigate();

  const careerStages = [
    "Fresher (Entry-Level)", 
    "Junior Professional", 
    "Mid-Level Professional", 
    "Senior-Level Professional"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!careerStage) return; // Prevent navigation if no option is selected
    // console.log({ careerStage });
    navigate("/Form2");
  };

  return (
    <div className="form1-page">
      <div className="form-container">
        <div className="form-card">
          <h2 className="form-title">Just a Few More Details</h2>
          <p className="form-subtitle">Help us personalize your experience by sharing your career stage.</p>
          <form onSubmit={handleSubmit} className="form-content">

            <div className="form-group">
              <label className="form-label">Select Your Career Stage:</label>
              <select 
                value={careerStage} 
                onChange={(e) => setCareerStage(e.target.value)} 
                required
              >
                <option value="">Select your career stage</option>
                {careerStages.map((stage) => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="form-button" disabled={!careerStage}>
              Next
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form1;
