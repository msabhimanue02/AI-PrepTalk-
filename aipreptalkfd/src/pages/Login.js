import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Import local CSS specifically for Login component

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email";

    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setServerMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (data.message === "Login successful") {
        localStorage.setItem("user", JSON.stringify(data.user)); 
        setServerMessage(" Login successful! Redirecting...");

        setTimeout(() => navigate("/Form1"), 2000);
      } else {
        setServerMessage(data.message || " Incorrect email or password.");
      }
    } catch (error) {
      setServerMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} disabled={isSubmitting} />
          {errors.email && <p className="error">{errors.email}</p>}

          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} disabled={isSubmitting} />
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Login"}</button>
        </form>

        {serverMessage && <p className="server-message">{serverMessage}</p>}

        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
