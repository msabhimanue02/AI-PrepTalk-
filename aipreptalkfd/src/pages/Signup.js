import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Auth.css";

export default function Signup() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
    else if (form.fullName.length < 3) newErrors.fullName = "Full Name must be at least 3 characters";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email address";

    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!form.confirmPassword.trim()) newErrors.confirmPassword = "Confirm Password is required";
    else if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerMessage("");

    fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Signup successful!") {
          setServerMessage(" Signup successful! Redirecting...");
          setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
          setTimeout(() => (window.location.href = "/login"), 2000);
        } else {
          setServerMessage(` ${data.message}`);
        }
      })
      .catch(() => setServerMessage(" Something went wrong. Try again."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
          {errors.fullName && <p className="error">{errors.fullName}</p>}

          <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          {errors.email && <p className="error">{errors.email}</p>}

          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
          {errors.password && <p className="error">{errors.password}</p>}

          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
          {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

          <button type="submit" disabled={loading}>{loading ? "Signing Up..." : "Sign Up"}</button>
        </form>

        {serverMessage && <p className="server-message">{serverMessage}</p>}

        <p className="auth-footer">Already have an account? <Link to="/Login">Login</Link></p>
      </div>
    </div>
  );
}
