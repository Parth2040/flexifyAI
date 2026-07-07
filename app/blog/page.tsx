import Link from "next/link";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { BLOG_POSTS, formatBlogDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — flexify ai",
  description:
    "Guides on AI image generation, realistic lifestyle photos, and AI photoshoots from Flexify AI.",
};

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-ink text-parchment flex flex-col">
      {/* Header */}
      <header className="border-b border-gold/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-xl font-semibold text-parchment hover:text-gold transition-colors"
          >
            flexify ai
          </Link>
          <Link href="/" className="text-sm text-mist hover:text-gold transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 md:py-16">
        <h1 className="font-serif text-3xl md:text-5xl font-semibold text-parchment mb-3">
          Blog
        </h1>
        <p className="text-mist mb-12 leading-relaxed">
          Guides on creating realistic, social-media-ready photos with AI.
        </p>

        <div className="flex flex-col gap-4">
          {[...BLOG_POSTS]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl border border-gold/10 bg-panel/30 p-6 hover:border-gold/30 hover:bg-panel/50 transition-all"
            >
              <p className="font-mono text-xs uppercase tracking-wider text-gold mb-2">
                {formatBlogDate(post.date)}
              </p>
              <h2 className="font-serif text-xl md:text-2xl font-semibold text-parchment leading-snug mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-mist leading-relaxed mb-3">{post.excerpt}</p>
              <span className="text-sm font-medium text-gold">Read more →</span>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
