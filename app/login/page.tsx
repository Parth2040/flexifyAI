"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Predefined starry coordinates to avoid hydration mismatches
const stars = [
  { top: "10%", left: "8%", size: "1px", opacity: 0.3 },
  { top: "15%", left: "75%", size: "2px", opacity: 0.5 },
  { top: "28%", left: "20%", size: "1px", opacity: 0.4 },
  { top: "35%", left: "88%", size: "2.5px", opacity: 0.6 },
  { top: "42%", left: "48%", size: "1.5px", opacity: 0.3 },
  { top: "55%", left: "12%", size: "2px", opacity: 0.5 },
  { top: "60%", left: "82%", size: "1px", opacity: 0.4 },
  { top: "72%", left: "25%", size: "2px", opacity: 0.6 },
  { top: "80%", left: "68%", size: "1px", opacity: 0.3 },
  { top: "88%", left: "92%", size: "2px", opacity: 0.5 },
  { top: "5%", left: "40%", size: "1.5px", opacity: 0.4 },
  { top: "22%", left: "60%", size: "1px", opacity: 0.3 },
  { top: "48%", left: "90%", size: "2px", opacity: 0.5 },
  { top: "68%", left: "55%", size: "1px", opacity: 0.4 },
  { top: "90%", left: "30%", size: "2px", opacity: 0.6 },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Surface any error passed back from the OAuth callback (?error=...).
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("error");
    if (err) setErrorMsg(err);
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/generate");
      } else {
        setErrorMsg(data.error || "Could not sign you in.");
      }
    } catch {
      setErrorMsg("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    // Full-page navigation: the server route redirects to Google's consent screen.
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-[#0d0d0d] text-white overflow-hidden px-4">
      {/* Starfield background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {stars.map((star, idx) => (
          <div
            key={idx}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
              animationDuration: `${3 + (idx % 3)}s`,
            }}
          />
        ))}
        {/* Gold themed space glow */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(215, 173, 102, 0.04) 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Header controls (Top Left & Top Right) */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white bg-neutral-900/40 hover:bg-neutral-800/60 border border-neutral-800/60 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <span>←</span> Back
        </button>
      </div>



      {/* Login Card */}
      <div className="w-full max-w-[420px] z-10 flex flex-col items-center">
        {/* Gold Sparkle Icon */}
        <div className="mb-6 text-gold animate-pulse">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-gold fill-gold/10"
          >
            <path d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2 Z" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-serif font-bold text-center tracking-tight text-white mb-2">
          Welcome back.
        </h1>
        <p className="text-sm text-neutral-400 text-center mb-8">
          Good to see you again.
        </p>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          {errorMsg && (
            <div className="text-xs text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {/* Continue with Google */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full flex items-center justify-center bg-[#232323] hover:bg-[#2d2d2d] border border-neutral-800/80 rounded-xl py-3.5 px-4 text-sm font-semibold transition-all cursor-pointer text-white"
          >
            {/* Google colored G logo */}
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center my-2">
            <div className="flex-grow border-t border-neutral-800/60"></div>
            <span className="px-4 text-xs font-mono text-neutral-500 uppercase tracking-widest">
              or
            </span>
            <div className="flex-grow border-t border-neutral-800/60"></div>
          </div>

          {/* Email input */}
          <div className="w-full">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-[#1d1d1d]/80 hover:bg-[#212121]/90 border border-neutral-800/80 focus:border-gold/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all"
            />
          </div>

          {/* Password input */}
          <div className="w-full flex flex-col">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-[#1d1d1d]/80 hover:bg-[#212121]/90 border border-neutral-800/80 focus:border-gold/50 rounded-xl px-4 py-3.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-gold/50 transition-all"
            />
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-xs text-gold hover:text-gold/80 transition-colors self-end mt-2 font-medium"
            >
              Forgot password?
            </a>
          </div>

          {/* Login Button using theme's btn-gold */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-gold !py-3.5 !w-full justify-center rounded-xl mt-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Signing in…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
