"use client";

import Footer from "@/components/Footer";
import FAQ from "@/components/Home/FAQ";
import Features from "@/components/Home/Features";
import Hero from "@/components/Home/Hero";

const page = () => {
  return (
    <>
    <div className="sm:mx-5 md:mx-8 lg:mx-10 xl:mx-15">
      <Hero/>
      <Features/>
      <FAQ/>
      </div>
      <div className="mx-0 px-0 min-w-[100%]">
      <Footer/>
      </div>
      </>
  );
};

export default page;
