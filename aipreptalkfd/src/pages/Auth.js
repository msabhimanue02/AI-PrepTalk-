import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Auth.css";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email address";

    if (!form.password.trim()) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    if (!isLogin) {
      if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
      else if (form.fullName.length < 3) newErrors.fullName = "Full Name must be at least 3 characters";

      if (!form.confirmPassword.trim()) newErrors.confirmPassword = "Confirm Password is required";
      else if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerMessage("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/signup";
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : { fullName: form.fullName, email: form.email, password: form.password };

    fetch(`http://localhost:5000${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message.includes("successful")) {
          setServerMessage("✅ " + data.message);
          setTimeout(() => navigate(isLogin ? "/chat" : "/login"), 2000);
          if (!isLogin) setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
        } else {
          setServerMessage("❌ " + (data.message || "Something went wrong"));
        }
      })
      .catch(() => setServerMessage("❌ Something went wrong. Try again."))
      .finally(() => setLoading(false));
  };

  return (
    <div className={`auth-container ${isLogin ? "login-mode" : "signup-mode"}`}>
      <div className="auth-box">
        <div className="form-container">
          <h2>{isLogin ? "Login" : "Sign Up"}</h2>
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input type="text" name="fullName" placeholder="Full Name" value={form.fullName} onChange={handleChange} />
                {errors.fullName && <p className="error">{errors.fullName}</p>}
              </>
            )}

            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            {errors.email && <p className="error">{errors.email}</p>}

            <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />
            {errors.password && <p className="error">{errors.password}</p>}

            {!isLogin && (
              <>
                <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
              </>
            )}

            <button type="submit" disabled={loading}>{loading ? (isLogin ? "Logging in..." : "Signing Up...") : (isLogin ? "Login" : "Sign Up")}</button>
          </form>

          {serverMessage && <p className="server-message">{serverMessage}</p>}
          
          <p className="toggle-auth">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLogin(!isLogin)} className="toggle-button">
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
        <div className="side-panel">
          <h3>{isLogin ? "New here?" : "Welcome back!"}</h3>
          <p>{isLogin ? "Create an account and start preparing with AI-PrepTalk!" : "Log in to access your mock interviews and progress."}</p>
          <button onClick={() => setIsLogin(!isLogin)} className="switch-btn">{isLogin ? "Sign Up" : "Login"}</button>
        </div>
      </div>
    </div>
  );
}
