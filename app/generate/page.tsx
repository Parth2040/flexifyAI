"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

type GenerationState = "idle" | "loading" | "result";

export default function GeneratePage() {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuthStore();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [genState, setGenState] = useState<GenerationState>("idle");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth Guard
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isLoggedIn) {
    return null;
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
      setGenState("idle");
      setProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    if (genState === "idle") {
      fileInputRef.current?.click();
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setGenState("idle");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    router.push("/");
  };

  const handleBackHome = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  const handleGenerate = () => {
    const finalPrompt = prompt.trim() || "Generate a photo of mine with supercar";
    if (!prompt.trim()) {
      setPrompt("Generate a photo of mine with supercar");
    }

    setGenState("loading");
    setProgress(0);

    // Simulate loading progress over 10 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 99) {
          clearInterval(interval);
          return 99;
        }
        return prev + 1;
      });
    }, 100);

    // After 10 seconds, show the static result image
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setGenState("result");
      }, 300);
    }, 10000);
  };

  const handleNewGeneration = () => {
    setGenState("idle");
    setProgress(0);
    setPrompt("");
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white flex flex-col justify-between overflow-x-hidden">
      {/* Top Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-neutral-900/60 bg-neutral-950/20 backdrop-blur-md z-10">
        <a
          href="#"
          onClick={handleBackHome}
          className="font-serif text-lg font-semibold tracking-tight text-neutral-300 hover:text-white transition-colors"
        >
          flexify ai
        </a>
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackHome}
            className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Home
          </button>
          <span className="text-neutral-800">|</span>
          <button
            onClick={handleLogout}
            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center justify-start py-8 px-4 max-w-lg mx-auto w-full">

        {/* ── LOADING STATE ── */}
        {genState === "loading" && (
          <div className="w-full flex flex-col items-center gap-6 animate-fadeIn mt-4">
            {/* Shimmer placeholder */}
            <div className="w-full h-[340px] rounded-2xl overflow-hidden relative bg-[#0d0e12] border border-neutral-800/60">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Processing"
                  className="w-full h-full object-cover opacity-30 blur-sm"
                />
              )}
              {/* Shimmer overlay */}
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(110deg, transparent 25%, rgba(226,168,92,0.06) 37%, rgba(226,168,92,0.12) 50%, rgba(226,168,92,0.06) 63%, transparent 75%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2s ease-in-out infinite",
                  }}
                />
              </div>
              {/* Centered spinner + status */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                <p className="font-sans text-sm font-medium text-white/80">
                  Generating your image…
                </p>
                <p className="font-mono text-xs text-neutral-500">
                  {progress}% complete
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs h-1 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── RESULT STATE ── */}
        {genState === "result" && (
          <div className="w-full flex flex-col items-center gap-5 animate-fadeIn mt-4">
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-neutral-200 text-center">
              Your generated image
            </h2>

            {/* Static result image */}
            <div className="w-full rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0c0e12] shadow-2xl shadow-black/60 relative group">
              <img
                src="/generated/result.jpg"
                alt="Generated result"
                className="w-full h-auto object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleNewGeneration}
                className="flex-1 py-3.5 bg-transparent border border-neutral-800 text-white hover:border-neutral-600 rounded-2xl font-sans text-sm font-medium transition-all cursor-pointer"
              >
                Generate another
              </button>
              <a
                href="/generated/result.jpg"
                download="flexify-generated.jpg"
                className="flex-1 py-3.5 bg-[#e2a85c] hover:bg-[#d4994f] text-black rounded-2xl font-sans text-sm font-bold transition-all cursor-pointer text-center shadow-[0_4px_20px_rgba(226,168,92,0.25)]"
              >
                Download
              </a>
            </div>
          </div>
        )}

        {/* ── IDLE STATE (Upload + Prompt) ── */}
        {genState === "idle" && (
          <>
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-center mb-6 text-neutral-200">
              Import your photo
            </h1>

            {/* Upload Dropzone — matching screenshot 2 style */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative w-full h-[280px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all duration-300 overflow-hidden ${
                dragActive
                  ? "border-[#e2a85c] bg-[#e2a85c]/5"
                  : "border-[#4a3b2c] bg-[#0c0e11] hover:border-[#856a42] hover:bg-[#121419]/40"
              }`}
            >
              {previewUrl ? (
                <div className="absolute inset-0 w-full h-full group z-20">
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={removeImage}
                      className="bg-red-600/90 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <div className="flex flex-col items-center text-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-[#1b1713] flex items-center justify-center border border-[#30261c] mb-4">
                      <svg
                        className="w-6 h-6 text-[#e2a85c]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                    <p className="text-base font-sans font-bold text-[#e2a85c] mb-1">
                      Click to upload
                    </p>
                    <p className="text-sm font-sans text-neutral-400 mb-6">
                      or drag and drop your photo here
                    </p>
                    <div className="flex gap-2.5">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-500 bg-[#121418] border border-neutral-800 px-3 py-1 rounded-md">JPG</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-500 bg-[#121418] border border-neutral-800 px-3 py-1 rounded-md">PNG</span>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-500 bg-[#121418] border border-neutral-800 px-3 py-1 rounded-md">WEBP</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Choose reference images */}
            <div className="mt-3">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center text-xs font-semibold text-[#e2a85c] hover:text-[#d4994f] transition-colors"
              >
                <svg
                  className="w-4 h-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="8" width="14" height="14" rx="2" ry="2" />
                  <path d="M7 4h14a2 2 0 0 1 2 2v14" />
                </svg>
                Choose reference images
              </a>
            </div>

            {/* Describe Your Scene card */}
            <div className="w-full bg-[#0c0e11] border border-neutral-900 rounded-2xl p-5 mt-6 shadow-2xl flex flex-col gap-3">
              <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500 block">
                DESCRIBE YOUR SCENE
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Standing in front of the Eiffel Tower at golden hour, wearing a tailored navy blazer..."
                className="bg-transparent text-white placeholder-neutral-600 outline-none text-sm w-full py-1 resize-none h-20 font-sans"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />

              <div className="flex justify-end items-center mt-2 border-t border-neutral-900/40 pt-3">
                <button
                  onClick={handleGenerate}
                  className="bg-[#e2a85c] hover:bg-[#d4994f] active:bg-[#c68b42] text-black font-sans font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Generate
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="w-full text-center py-6 text-[10px] font-mono text-neutral-600 border-t border-neutral-950/20">
        &copy; {new Date().getFullYear()} LifeFlexIA. All rights reserved.
      </footer>

      {/* Shimmer animation keyframes */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
