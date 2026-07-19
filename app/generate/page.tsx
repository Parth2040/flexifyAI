"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/hooks/useSession";
import CoinIcon from "@/components/CoinIcon";
import { REFERENCE_IMAGES } from "@/lib/references";

type GenerationState = "idle" | "loading" | "result" | "error";

// Reference image must be one of these formats.
const ALLOWED_TYPES = ["image/jpeg", "image/png"]; // image/jpeg covers .jpg & .jpeg

// Price shown on the locked result — the cheapest plan (Starter).
const UNLOCK_PRICE = "$4";

// Credits each generation costs (mirrors CREDITS_PER_GENERATION on the server).
const GENERATION_COST = 10;

// Fixed teaser image shown (blurred) when the user can't afford a generation.
// No AI is ever called in this case.
const LOCKED_PLACEHOLDER = "/locked-preview.jpg";

// How long the "generating" loader runs for the no-credits path (ms).
const NO_CREDITS_LOADING_MS = 10000;

export default function GeneratePage() {
  const router = useRouter();
  const { isLoggedIn, loading: sessionLoading, logout } = useSession();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDims, setImageDims] = useState<{ w: number; h: number } | null>(null);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [showReferences, setShowReferences] = useState(false);
  const [brokenRefs, setBrokenRefs] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [genState, setGenState] = useState<GenerationState>("idle");
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultUnlocked, setResultUnlocked] = useState(false);
  const [tokens, setTokens] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refImagesInput = useRef<HTMLInputElement>(null);
  const progressTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth guard (proxy.ts also protects this route server-side).
  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [sessionLoading, isLoggedIn, router]);

  // Load the live token balance once signed in.
  useEffect(() => {
    if (sessionLoading || !isLoggedIn) return;
    fetch("/api/account")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.tokens === "number") setTokens(d.tokens);
      })
      .catch(() => {});
  }, [sessionLoading, isLoggedIn]);

  // Clean up object URL + timers on unmount.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [previewUrl]);

  if (sessionLoading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMsg("Unsupported format. Please upload a JPG, JPEG, or PNG image.");
      setGenState("error");
      return;
    }
    setSelectedFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // Read the natural dimensions so we can match the output aspect ratio.
    setImageDims(null);
    const img = new window.Image();
    img.onload = () => setImageDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    setErrorMsg("");
    setGenState("idle");
    setProgress(0);
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
    if (e.target.files && e.target.files[0]) processFile(e.target.files[0]);
  };

  // The single reference image — either uploaded from PC or picked from ours.
  const setReference = (file: File, preview: string) => {
    if (referencePreview && referencePreview.startsWith("blob:")) {
      URL.revokeObjectURL(referencePreview);
    }
    setReferenceFile(file);
    setReferencePreview(preview);
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !ALLOWED_TYPES.includes(file.type)) return;
    setReference(file, URL.createObjectURL(file));
    if (refImagesInput.current) refImagesInput.current.value = "";
  };

  // Pick one of the predefined references — fetch it as a File so it goes to the
  // API exactly like an uploaded reference image. Replaces any current pick.
  const selectPredefinedReference = async (src: string) => {
    if (referencePreview === src) {
      clearReference(); // tapping the selected one deselects it
      return;
    }
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      // Give the File an extension matching its real type (e.g. .jfif → .jpg)
      // so the OpenAI edits endpoint accepts it.
      const type = blob.type || "image/jpeg";
      const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
      const file = new File([blob], `reference.${ext}`, { type });
      setReference(file, src);
    } catch {
      /* ignore */
    }
  };

  const clearReference = () => {
    if (referencePreview && referencePreview.startsWith("blob:")) {
      URL.revokeObjectURL(referencePreview);
    }
    setReferenceFile(null);
    setReferencePreview(null);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageDims(null);
    setGenState("idle");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleBackHome = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    router.push("/");
  };

  // Unlock requires payment — send the user to the pricing section.
  const goToPricing = () => {
    router.push("/#pricing");
  };

  const startFakeProgress = () => {
    setProgress(0);
    progressTimer.current = setInterval(() => {
      // Creep toward 90% while we wait for the real response.
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.max(1, Math.round((90 - prev) / 12))));
    }, 400);
  };

  const stopProgress = () => {
    if (progressTimer.current) {
      clearInterval(progressTimer.current);
      progressTimer.current = null;
    }
  };

  const handleGenerate = async () => {
    // All three are required: your photo, a reference image, and a prompt.
    const finalPrompt = prompt.trim();
    const missing: string[] = [];
    if (!selectedFile) missing.push("your photo");
    if (!referenceFile) missing.push("a reference image");
    if (!finalPrompt) missing.push("a prompt");
    if (!selectedFile || missing.length > 0) {
      setAlertMsg(`Please provide ${missing.join(", ")} before generating.`);
      return;
    }
    setAlertMsg("");

    // Not enough credits → still play the 10s "generating" loader, then reveal
    // the fixed default image (blurred). The AI is never called.
    if (tokens !== null && tokens < GENERATION_COST) {
      setErrorMsg("");
      setGenState("loading");
      startFakeProgress();
      revealTimer.current = setTimeout(() => {
        stopProgress();
        setProgress(100);
        setResultUrl(LOCKED_PLACEHOLDER);
        setResultUnlocked(false);
        setGenState("result");
      }, NO_CREDITS_LOADING_MS);
      return;
    }

    setErrorMsg("");
    setGenState("loading");
    startFakeProgress();

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("prompt", finalPrompt);
      if (referenceFile) formData.append("referenceImages", referenceFile);
      if (imageDims) {
        formData.append("width", String(imageDims.w));
        formData.append("height", String(imageDims.h));
      }

      const res = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await res.json();

      stopProgress();

      // Server says not enough credits → fixed blurred teaser (no AI was used).
      if (res.status === 402 || data.insufficientCredits) {
        if (typeof data.tokens === "number") setTokens(data.tokens);
        setResultUrl(LOCKED_PLACEHOLDER);
        setResultUnlocked(false);
        setProgress(100);
        setTimeout(() => setGenState("result"), 300);
        return;
      }

      if (!res.ok) {
        if (typeof data.tokens === "number") setTokens(data.tokens);
        setErrorMsg(data.error || "Image generation failed. Please try again.");
        setGenState("error");
        return;
      }

      setProgress(100);
      setResultUrl(data.image);
      setResultUnlocked(!!data.unlocked);
      if (typeof data.tokens === "number") setTokens(data.tokens);
      setTimeout(() => setGenState("result"), 300);
    } catch {
      stopProgress();
      setErrorMsg("Connection error. Please check your network and try again.");
      setGenState("error");
    }
  };

  const handleNewGeneration = () => {
    stopProgress();
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setGenState("idle");
    setProgress(0);
    setPrompt("");
    setSelectedFile(null);
    setResultUrl(null);
    setErrorMsg("");
    setAlertMsg("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setImageDims(null);
    clearReference();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-white flex flex-col justify-between overflow-x-hidden relative">
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] blur-[140px] opacity-60"
        style={{ background: "radial-gradient(circle, rgba(226,168,92,0.10) 0%, transparent 70%)" }}
        aria-hidden="true"
      />

      {/* Top Header */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between gap-2 border-b border-neutral-900/60 bg-neutral-950/30 backdrop-blur-md z-10">
        <a
          href="#"
          onClick={handleBackHome}
          className="font-serif text-base sm:text-lg font-semibold tracking-tight text-neutral-300 hover:text-white transition-colors shrink-0"
        >
          flexify ai
        </a>
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Credits — click to see balance & full transaction history */}
          <button
            onClick={() => router.push("/account")}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#e2a85c] bg-[#e2a85c]/10 border border-[#e2a85c]/30 hover:bg-[#e2a85c]/20 px-2.5 sm:px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap"
            title="View credits & transaction history"
          >
            <CoinIcon className="w-3.5 h-3.5" />
            <span>{(tokens ?? 0).toLocaleString()} credits</span>
          </button>
          <button onClick={handleBackHome} className="text-xs font-medium text-neutral-400 hover:text-white transition-colors hidden sm:inline">
            Home
          </button>
          <span className="text-neutral-800 hidden sm:inline">|</span>
          <button onClick={handleLogout} className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer whitespace-nowrap">
            Log out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex flex-col items-center justify-start py-10 px-4 max-w-lg mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          {/* ── LOADING STATE ── */}
          {genState === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-6 mt-4"
            >
              <div className="w-full h-[360px] rounded-2xl overflow-hidden relative bg-[#0d0e12] border border-neutral-800/60">
                {previewUrl && (
                  <img src={previewUrl} alt="Processing" className="w-full h-full object-cover opacity-30 blur-sm" />
                )}
                <div className="absolute inset-0 overflow-hidden">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 25%, rgba(226,168,92,0.06) 37%, rgba(226,168,92,0.12) 50%, rgba(226,168,92,0.06) 63%, transparent 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 2s ease-in-out infinite",
                    }}
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <p className="font-sans text-sm font-medium text-white/80">Generating your image…</p>
                  <p className="font-mono text-xs text-neutral-500">{progress}% complete</p>
                </div>
              </div>
              <div className="w-full max-w-xs h-1 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-neutral-600 text-center">
                This can take up to a minute — hang tight.
              </p>
            </motion.div>
          )}

          {/* ── RESULT STATE ── */}
          {genState === "result" && resultUrl && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-5 mt-4"
            >
              {resultUnlocked ? (
                /* ── UNLOCKED: clear image + download ── */
                <>
                  <h2 className="text-xl sm:text-2xl font-serif font-semibold text-neutral-200 text-center">
                    Your image is ready
                  </h2>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0c0e12] shadow-2xl shadow-black/60"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resultUrl} alt="Generated result" className="w-full h-auto object-cover" />
                  </motion.div>
                  <div className="flex gap-3 w-full">
                    <button
                      onClick={handleNewGeneration}
                      className="flex-1 py-3.5 bg-transparent border border-neutral-800 text-white hover:border-neutral-600 rounded-2xl font-sans text-sm font-medium transition-all cursor-pointer"
                    >
                      Generate another
                    </button>
                    <a
                      href={resultUrl}
                      download="flexify-generated.png"
                      className="flex-1 py-3.5 bg-[#e2a85c] hover:bg-[#d4994f] text-black rounded-2xl font-sans text-sm font-bold transition-all cursor-pointer text-center shadow-[0_4px_20px_rgba(226,168,92,0.25)] flex items-center justify-center"
                    >
                      Download
                    </a>
                  </div>
                </>
              ) : (
                /* ── LOCKED: blurred preview, pay to unlock ── */
                <>
                  <div className="flex items-center gap-2 text-neutral-200">
                    <svg className="w-5 h-5 text-[#e2a85c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold text-center">
                      Unlock your image
                    </h2>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full rounded-2xl overflow-hidden border border-white/[0.06] bg-[#0c0e12] shadow-2xl shadow-black/60 relative"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultUrl}
                      alt="Generated result preview (locked)"
                      draggable={false}
                      className="w-full h-auto object-cover blur-2xl scale-110 select-none pointer-events-none"
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/45 text-center px-6">
                      <div className="w-12 h-12 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white shadow-lg">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                      <p className="font-sans text-sm font-semibold text-white">
                        Unlock for {UNLOCK_PRICE}
                      </p>
                    </div>
                  </motion.div>

                  <button
                    onClick={goToPricing}
                    className="w-full flex items-center justify-center gap-2 bg-[#e2a85c] hover:bg-[#d4994f] active:bg-[#c68b42] text-black font-sans font-bold text-sm py-3.5 rounded-2xl transition-all shadow-[0_4px_20px_rgba(226,168,92,0.3)] cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                    Unlock with a plan
                  </button>

                  <button
                    onClick={handleNewGeneration}
                    className="text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    Generate another
                  </button>
                </>
              )}
            </motion.div>
          )}

          {/* ── ERROR STATE ── */}
          {genState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center gap-5 mt-10 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-900/50 flex items-center justify-center text-red-400">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-sm text-neutral-300 max-w-sm">{errorMsg}</p>
              <button
                onClick={() => setGenState("idle")}
                className="px-6 py-3 bg-[#e2a85c] hover:bg-[#d4994f] text-black rounded-2xl font-sans text-sm font-bold transition-all cursor-pointer"
              >
                Try again
              </button>
            </motion.div>
          )}

          {/* ── IDLE STATE (Upload + Prompt) ── */}
          {genState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Validation alert — which required item is missing */}
              {alertMsg && (
                <div className="w-full flex items-start gap-2.5 bg-red-950/40 border border-red-900/60 text-red-300 rounded-xl px-4 py-3 mb-4">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-sm font-medium">{alertMsg}</span>
                  <button
                    onClick={() => setAlertMsg("")}
                    aria-label="Dismiss"
                    className="ml-auto text-red-400/70 hover:text-red-300 cursor-pointer text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              )}

              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-center mb-2 text-neutral-200">
                Import your photo
              </h1>
              <p className="text-sm text-neutral-300 text-center mb-6">
                Upload a clear, full photo of yourself to generate luxury lifestyle images.
              </p>

              {/* Upload Dropzone */}
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
                    <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
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
                      accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                      onChange={handleChange}
                    />
                    <div className="flex flex-col items-center text-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full bg-[#1b1713] flex items-center justify-center border border-[#30261c] mb-4">
                        <svg className="w-6 h-6 text-[#e2a85c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </div>
                      <p className="text-base font-sans font-bold text-[#e2a85c] mb-1">Drag your photo here</p>
                      <p className="text-sm font-sans text-neutral-400 mb-6">or click to select</p>
                      <div className="flex gap-2.5">
                        {["JPG", "JPEG", "PNG"].map((ext) => (
                          <span key={ext} className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-500 bg-[#121418] border border-neutral-800 px-3 py-1 rounded-md">
                            {ext}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Choose ONE reference image — upload one or pick one of ours. */}
              <div className="w-full mt-4 flex flex-col items-center">
                  <input
                    ref={refImagesInput}
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleReferenceChange}
                  />
                  <button
                    onClick={() => refImagesInput.current?.click()}
                    className="flex items-center gap-2 text-sm font-semibold text-[#e2a85c] hover:text-[#d4994f] transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    Choose a reference image
                    <span className="text-xs font-normal text-[#e2a85c]/70">(required, pick one)</span>
                  </button>

                  {/* Selected reference preview (single) */}
                  {referencePreview && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#e2a85c] mt-3 group">
                      <img src={referencePreview} alt="Selected reference" className="w-full h-full object-cover" />
                      <button
                        onClick={clearReference}
                        aria-label="Remove reference image"
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white text-sm leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  {/* Browse references — opens a full-screen picker (only when the folder has any) */}
                  {REFERENCE_IMAGES.length > 0 && (
                    <button
                      onClick={() => setShowReferences(true)}
                      className="text-xs font-medium text-neutral-400 hover:text-neutral-200 transition-colors mt-3 cursor-pointer"
                    >
                      Browse references
                      <span className="text-neutral-600"> — or pick one of ours</span>
                    </button>
                  )}
                </div>

              {/* Describe Your Scene card */}
              <div className="w-full bg-[#0c0e11] border border-neutral-800 rounded-2xl p-4 mt-6 shadow-2xl">
                <div className="flex items-start gap-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. replace the car with a Lamborghini"
                    className="flex-1 bg-transparent text-white placeholder-neutral-500 outline-none text-sm py-1 resize-none h-16 font-sans"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={!selectedFile}
                    title={selectedFile ? `Generate — uses ${GENERATION_COST} tokens` : "Upload your photo first"}
                    aria-label="Generate"
                    className="shrink-0 w-9 h-9 rounded-full bg-[#e2a85c] hover:bg-[#d4994f] active:bg-[#c68b42] disabled:bg-[#e2a85c]/25 disabled:cursor-not-allowed text-black flex items-center justify-center transition-all shadow-md cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </button>
                </div>
                <p className="text-right text-[11px] text-neutral-500 font-mono mt-2">
                  Generate — {GENERATION_COST} tokens
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-[10px] font-mono text-neutral-600 border-t border-neutral-950/20 z-10">
        &copy; {new Date().getFullYear()} flexify ai. All rights reserved.
      </footer>

      {/* ── Reference picker (full-screen) ── */}
      {showReferences && (
        <div className="fixed inset-0 z-50 bg-[#07080b] flex flex-col">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-neutral-900/60 bg-neutral-950/40 backdrop-blur-md">
            <div>
              <h2 className="font-serif text-lg font-semibold text-neutral-200">Choose a reference image</h2>
              <p className="text-xs text-neutral-500">Tap one to use it, then you&apos;ll return to create.</p>
            </div>
            <button
              onClick={() => setShowReferences(false)}
              className="flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {REFERENCE_IMAGES.filter((src) => !brokenRefs.includes(src)).map((src) => {
                const selected = referencePreview === src;
                return (
                  <button
                    key={src}
                    onClick={() => {
                      selectPredefinedReference(src);
                      setShowReferences(false);
                    }}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      selected
                        ? "border-[#e2a85c] ring-2 ring-[#e2a85c]/40"
                        : "border-neutral-800 hover:border-[#856a42]"
                    }`}
                  >
                    <img
                      src={src}
                      alt="Reference"
                      className="w-full h-full object-cover"
                      onError={() => setBrokenRefs((p) => [...p, src])}
                    />
                    {selected && (
                      <div className="absolute inset-0 bg-[#e2a85c]/25 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-[#e2a85c] text-black flex items-center justify-center">
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
