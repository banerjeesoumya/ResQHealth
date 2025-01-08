"use client";

import Image from "next/image";
import { SocialLinks } from "./SocialLinks";
import { footerLinks } from "./FooterLinks";

export default function Footer() {
  return (
    <footer
      className="bg-gradient-to-b from-teal-600 to-teal-700 text-white  transition-all duration-300 ease-in-out "
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <Image
                src="https://ui.metamorix.com/favicon.ico"
                alt="ResQ Health Logo"
                width={32}
                height={40}
                className="h-10 w-8"
              />
              <p className="text-base text-white ml-2">
                <span className="font-bold">ResQ</span>
                Health
              </p>
            </div>
            <p className="text-sm leading-6 text-gray-300">
              AI-powered assistant for personalized care and proactive public
              health solutions.
            </p>
            <SocialLinks />
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Product
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.product.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Company
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {footerLinks.company.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-6 text-white">
                Team
              </h3>
              <ul role="list" className="mt-6 space-y-4">
                {footerLinks.team.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      className="text-sm leading-6 text-gray-300 hover:text-white"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white pt-8 sm:mt-20 lg:mt-24">
          <p className="text-xs leading-5 text-white">
            &copy; {new Date().getFullYear()} ResQ Health. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
