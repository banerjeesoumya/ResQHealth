"use client";

import Footer from "@/components/Footer";
import FAQ from "@/components/Home/FAQ";
import Features from "@/components/Home/Features";
import Hero from "@/components/Home/Hero";

const page = () => {
  return (
    <div>
      <Hero />
      <Features />
      <FAQ />
      <Footer />
    </div>
  );
};

export default page;
