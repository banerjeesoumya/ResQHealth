"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does ResQ Health's AI diagnostic system work?",
    answer:
      "Our AI system uses Retrieval-Augmented Generation (RAG) technology to analyze your health data and provide personalized assistance. It combines WHO guidelines with your personal health profile to deliver accurate, context-aware recommendations.",
  },
  {
    question: "What kind of health emergencies can ResQ Health help with?",
    answer:
      "ResQ Health provides support during various public health emergencies, including pandemics. It offers real-time information about symptoms, prevention measures, vaccination guidance, and emergency protocols based on official health guidelines.",
  },
  {
    question: "How does the product safety scanner feature work?",
    answer:
      "Using the OpenFoodFacts API, our scanner analyzes product barcodes to retrieve detailed ingredient information. It then cross-references this data with your personal health profile to alert you about potential allergens or harmful substances.",
  },
  {
    question: "Is my health data secure?",
    answer:
      "Yes, your health data is securely stored in our vector database using PostgreSQL with pgvector. We implement strict security measures and ensure all personal health information is encrypted and protected.",
  },
  {
    question: "How does ResQ Health help with vaccine hesitancy?",
    answer:
      "We provide evidence-based information from trusted sources like WHO, addressing concerns with empathy and scientific data. Our AI assistant helps users make informed decisions by explaining vaccine benefits and addressing common misconceptions.",
  },
  {
    question: "Can I access real-time health statistics?",
    answer:
      "Yes, ResQ Health features a dashboard showing current public health statistics and trends. This helps you stay informed about health situations in your area and make data-driven decisions about your health.",
  },
];

export default function FAQ() {
  return (
    <div id="faq" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
            Frequently Asked Questions
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Find answers to common questions about ResQ Health&apos;s AI-powered
            healthcare platform
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
