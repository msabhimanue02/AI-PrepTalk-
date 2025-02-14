// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/Form1.css";

// const Form1 = () => {
//   const [careerStage, setCareerStage] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!careerStage) return; // Prevent navigation if no option is selected
//     console.log({ careerStage });
//     navigate("/form2");
//   };

//   return (
//     <div className="form-container">
//       <div className="form-card">
//         <h2 className="form-title">Just a Few More Details</h2>
//         <p className="form-subtitle">Help us personalize your experience by sharing your career stage.</p>
//         <form onSubmit={handleSubmit} className="form-content">
//           <div className="form-group">
//             <label className="form-label">What stage of your career journey are you currently at?</label>
//             <div className="form-options">
//               {[
//                 { label: "Fresher (Entry-Level)", value: "fresher" },
//                 { label: "Junior Professional", value: "junior" },
//                 { label: "Mid-Level Professional", value: "mid" },
//                 { label: "Senior-Level Professional", value: "senior" },
//               ].map((option) => (
//                 <label key={option.value} className={`form-option ${careerStage === option.value ? "selected" : ""}`}>
//                   {option.label}
//                   <input
//                     type="radio"
//                     name="careerStage"
//                     value={option.value}
//                     checked={careerStage === option.value}
//                     onChange={() => setCareerStage(option.value)}
//                     className="form-radio"
//                   />
//                   <span className="custom-radio"></span>
//                 </label>
//               ))}
//             </div>
//           </div>
//           <button type="submit" className="form-button" disabled={!careerStage}>
//             Next
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Form1;