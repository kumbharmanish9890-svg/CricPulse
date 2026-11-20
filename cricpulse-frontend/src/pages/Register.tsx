import { useState, type FormEvent } from "react";
import api from "../services/api";
import "./Register.css";

interface RegisterProps {
  onBackToLogin: () => void;
}

function Register({ onBackToLogin }: RegisterProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(false);

    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/auth/register", {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: "VIEWER",
      });
      setMessage(response.data?.message || "Registration successful! You can now login.");
      setIsSuccess(true);
      setForm({ fullName: "", email: "", password: "", confirmPassword: "" });
    } catch (error: any) {
      const data = error.response?.data;
      const errorMessage = typeof data === "string"
        ? data
        : data?.message || data?.error || "Registration failed. Please try again.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>🏏 CricPulse</h1>
        <h2>Create Account</h2>
        <p>Join CricPulse Cricket Management System</p>

        {message && (
          <div className={`register-message ${isSuccess ? "success" : "failure"}`} role="alert">
            {message}
          </div>
        )}

        <label htmlFor="register-fullname">Full Name</label>
        <input
          id="register-fullname"
          type="text"
          placeholder="Enter your full name"
          value={form.fullName}
          onChange={(e) => handleChange("fullName", e.target.value)}
          autoComplete="name"
          required
        />

        <label htmlFor="register-email">Email Address</label>
        <input
          id="register-email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={(e) => handleChange("password", e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <label htmlFor="register-confirm-password">Confirm Password</label>
        <input
          id="register-confirm-password"
          type="password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="register-login-text">
          Already have an account?{" "}
          <a
            href="#login"
            onClick={(e) => {
              e.preventDefault();
              onBackToLogin();
            }}
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

export default Register;
