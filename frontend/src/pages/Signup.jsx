import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await signup(username, password);
      navigate("/login");
    } catch {
      setError("Signup failed");
    }
  }

  return (
    <div className="auth-page">
      <h1>Sign Up</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Sign Up</button>
        <Link to="/login">Already have an account? Login</Link>
      </form>
    </div>
  );
}
