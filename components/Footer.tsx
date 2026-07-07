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
                    fill="none"
                    stroke="currentColor"
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
