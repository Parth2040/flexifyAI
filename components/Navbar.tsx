"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import PrebookModal from "./PrebookModal";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const { isLoggedIn, logout, prebookOpen, setPrebookOpen } = useAuthStore();
  const router = useRouter();

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      logout();
      router.push("/");
    } else {
      router.push("/login");
    }
  };

  const handlePrebookClick = async () => {
    setPrebookOpen(true);
    try {
      await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric: "prebook" }),
      });
    } catch (err) {
      console.error("Failed to track prebook click:", err);
    }
  };
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleNavClick = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? "bg-ink/80 backdrop-blur-xl border-b border-gold/10"
            : "bg-transparent"
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="#"
              className="font-serif text-xl md:text-2xl font-semibold text-parchment tracking-tight hover:text-gold transition-colors"
            >
              flexify ai
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-sans text-mist hover:text-parchment transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handlePrebookClick}
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-sans font-bold text-xs uppercase tracking-wider transition-all shadow-[0_4px_16px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.3)] cursor-pointer text-center py-2.5 px-5"
              >
                Get started
              </button>
              <a
                href="#"
                className="btn-ghost text-sm"
                onClick={handleLoginClick}
              >
                {isLoggedIn ? "Log out" : "Log in"}
              </a>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden relative w-8 h-8 flex items-center justify-center"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span
                className={`absolute h-[2px] w-5 bg-parchment transition-all duration-300 ${mobileOpen ? "rotate-45" : "-translate-y-1.5"
                  }`}
              />
              <span
                className={`absolute h-[2px] w-5 bg-parchment transition-all duration-300 ${mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
              />
              <span
                className={`absolute h-[2px] w-5 bg-parchment transition-all duration-300 ${mobileOpen ? "-rotate-45" : "translate-y-1.5"
                  }`}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-ink/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 md:hidden"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className="font-serif text-3xl text-parchment hover:text-gold transition-colors"
                onClick={handleNavClick}
                initial={
                  prefersReducedMotion ? {} : { opacity: 0, y: 20 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                {link.label}
              </motion.a>
            ))}

            <div className="flex flex-col items-center gap-4 mt-4 w-full px-6">
              <button
                onClick={() => {
                  handlePrebookClick();
                  handleNavClick();
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl font-sans font-bold text-sm transition-all py-3.5 px-6 cursor-pointer text-center shadow-[0_4px_16px_rgba(99,102,241,0.2)]"
              >
                Get started
              </button>
              <a
                href="#"
                className="text-mist hover:text-parchment transition-colors text-lg"
                onClick={(e) => {
                  handleLoginClick(e);
                  handleNavClick();
                }}
              >
                {isLoggedIn ? "Log out" : "Log in"}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prebook Modal */}
      {prebookOpen && (
        <PrebookModal isOpen={prebookOpen} onClose={() => setPrebookOpen(false)} />
      )}
    </>
  );
}
