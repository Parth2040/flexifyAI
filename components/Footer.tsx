"use client";

const navLinks = [
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

const socialIcons = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/_flexify_ai/",
    paths: [
      "M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2zM12 8a4 4 0 100 8 4 4 0 000-8zm5.5-1.5a1 1 0 100-2 1 1 0 000 2z",
    ],
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@flexify-r1b",
    paths: [
      "M2.5 17a24.12 24.12 0 010-10 2 2 0 011.4-1.4 49.56 49.56 0 0116.2 0A2 2 0 0121.5 7a24.12 24.12 0 010 10 2 2 0 01-1.4 1.4 49.55 49.55 0 01-16.2 0A2 2 0 012.5 17",
      "M10 9l5 3-5 3z",
    ],
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@dean.smith233",
    filled: true,
    paths: [
      "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-panel/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Logo & tagline */}
          <div>
            <a
              href="/"
              className="font-serif text-xl font-semibold text-parchment hover:text-gold transition-colors"
            >
              flexify ai
            </a>
            <p className="text-sm text-mist mt-3 leading-relaxed max-w-xs">
              Your ticket to anywhere, without leaving home. Ultra-realistic AI
              image generation in 4K.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="font-mono text-xs text-mist uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-mist hover:text-gold transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & legal */}
          <div>
            <h4 className="font-mono text-xs text-mist uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex gap-3 mb-6">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-mist hover:text-gold hover:bg-gold/20 transition-all"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill={social.filled ? "currentColor" : "none"}
                    stroke={social.filled ? "none" : "currentColor"}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {social.paths.map((d, i) => (
                      <path key={i} d={d} />
                    ))}
                  </svg>
                </a>
              ))}
            </div>

            <div className="mb-6">
              <h4 className="font-mono text-xs text-mist uppercase tracking-wider mb-2">
                Support
              </h4>
              <a
                href="mailto:flexifyai321@gmail.com"
                className="text-sm text-mist hover:text-gold transition-colors break-all"
              >
                flexifyai321@gmail.com
              </a>
            </div>

            <div className="space-y-1.5">
              <a
                href="#"
                className="block text-xs text-mist/60 hover:text-gold transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="block text-xs text-mist/60 hover:text-gold transition-colors"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-gold/5">
          <p className="font-mono text-xs text-mist/40 text-center">
            &copy; {new Date().getFullYear()} flexify ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
