import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css"; // Import local CSS specifically for Login component


export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  const validateForm = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email";


    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 4) newErrors.password = "Must be at least 6 characters";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setServerMessage("");

    try {
      await login(form.email, form.password);
      setServerMessage("Login successful! Redirecting...");

      setTimeout(() => navigate("/Form2"), 2000);
    } catch (error) {
      setServerMessage(/*error.message ||*/  "Login failed. Please try again.");
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
