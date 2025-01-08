"use client";

import {
  BarChart3,
  Bell,
  Brain,
  Heart,
  Microscope,
  Shield,
} from "lucide-react";

const features = [
  {
    name: "Pandemic Preparedness",
    description:
      "Access real-time information and guidance during public health emergencies, including symptom tracking and vaccination updates.",
    icon: Microscope,
  },
  {
    name: "AI-Powered Chatbot",
    description:
      "A RAG-based chatbot that provides personalized health support, incorporating multimodal inputs for accurate and empathetic responses.",
    icon: Brain,
  },
  {
    name: "Product Safety Scanner",
    description:
      "Scan barcodes to fetch ingredient details and receive personalized safety recommendations based on your health profile.",
    icon: Shield,
  },
  {
    name: "Personalized Health Alerts",
    description:
      "Receive alerts tailored to your health profile about allergens, harmful substances, and risky activities.",
    icon: Bell,
  },
  {
    name: "Comprehensive Health Dashboard",
    description:
      "Monitor public health statistics and trends in real-time to make informed decisions about your health.",
    icon: BarChart3,
  },
  {
    name: "Empathetic Vaccine Guidance",
    description:
      "Access evidence-based, empathetic support to address vaccine concerns and misinformation effectively.",
    icon: Heart,
  },
];

export default function Features() {
  return (
    <div id="features" className="py-24 sm:py-32 ">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-green-400">
            Transforming Healthcare Delivery
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Cutting-edge features that revolutionize how you receive and manage
            healthcare
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="text-base font-semibold leading-7">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-green-400">
                    <feature.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-400">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
