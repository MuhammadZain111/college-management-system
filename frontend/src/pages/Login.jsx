import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Seal from "../components/Seal";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Seal size={56} />
          <h1 className="font-display text-2xl text-ink mt-4">Portal Sign In</h1>
          <p className="text-sm text-slate mt-1">One login form, routed to your role's dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">
          {error && (
            <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-sm px-3 py-2">
              {error}
            </div>
          )}
          <div>
            <label className="label">Email address</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-slate mt-6">
          <Link to="/" className="hover:text-ink">← Back to college home</Link>
        </p>
      </div>
    </div>
  );
}
