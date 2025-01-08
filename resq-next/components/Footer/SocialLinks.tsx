"use client";

import { Github, Youtube } from "lucide-react";

export const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/banerjeesoumya/ResQHealth",
    icon: Github,
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/watch?v=O5iZHVufFL8",
    icon: Youtube,
  },
];

export function SocialLinks() {
  return (
    <div className="flex space-x-6">
      {socialLinks.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="text-gray-500 hover:text-gray-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">{item.name}</span>
          <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}
