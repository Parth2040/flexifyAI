import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import BeforeAfterShowcase from "@/components/BeforeAfterShowcase";
import InspirationGallery from "@/components/InspirationGallery";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BeforeAfterShowcase />
        <InspirationGallery />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
