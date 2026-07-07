import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Footer from "@/components/Footer";
import BlogContent from "@/components/BlogContent";
import { getPostBySlug, BLOG_POSTS, formatBlogDate } from "@/lib/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: post ? `${post.title} — flexify ai` : "Blog — flexify ai",
    description: post?.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

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
          <Link href="/blog" className="text-sm text-mist hover:text-gold transition-colors">
            ← All posts
          </Link>
        </div>
      </header>

      <article className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 md:py-16">
        <p className="font-mono text-xs uppercase tracking-wider text-gold mb-3">
          {formatBlogDate(post.date)}
        </p>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-parchment leading-tight mb-8">
          {post.title}
        </h1>

        <BlogContent content={post.content} />

        <div className="mt-14 pt-8 border-t border-gold/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link href="/generate" className="btn-gold">
            Try Flexify AI
          </Link>
          <Link href="/blog" className="text-sm text-mist hover:text-gold transition-colors">
            ← Back to all posts
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
}
