'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful! Welcome Admin");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Login failed!");
      }
    } catch (error) {
      toast.error("Network error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="bg-surface rounded-2xl p-8 w-full max-w-sm shadow-xl border border-rule">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber rounded-2xl flex items-center justify-center text-2xl font-serif text-ink mx-auto mb-4">
            VB
          </div>
          <h1 className="text-2xl font-serif text-ink tracking-tight">Vegetable Boy</h1>
          <p className="text-meta text-sm mt-1 font-mono">Admin Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 bg-cream border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber transition-all font-mono"
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-mid mb-1 block uppercase tracking-wider font-mono">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-cream border-2 border-rule rounded-xl text-sm text-ink outline-none focus:border-amber transition-all font-mono"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-ink text-cream rounded-xl text-sm font-bold hover:bg-mid transition-all disabled:opacity-50 font-mono tracking-wide"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-meta font-mono">
          <p>First time? Create admin via seed API.</p>
        </div>
      </div>
    </div>
  );
}
