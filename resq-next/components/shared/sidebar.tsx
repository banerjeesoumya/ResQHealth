"use client";
import React, { useEffect, useState } from "react";
import { PanelRightOpen, PanelLeftOpen } from "lucide-react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ChatHistory {
  chatID: string;
}

interface SidebarProps {
  title: string;
  sidebarItems: { name: string; href: string }[];
  historyIDs?: ChatHistory[] | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  title,
  sidebarItems,
  historyIDs,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsOpen(window.innerWidth >= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-blue-700 text-white">
        {isOpen ? (
          <div></div>
        ) : (
          <PanelLeftOpen size={24} onClick={() => setIsOpen(!isOpen)} />
        )}
      </div>

      {/* Sidebar */}
      <div
        className={`fixed flex flex-col justify-between md:relative top-0 left-0 h-full bg-teal-600 text-white w-64 p-6 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className="text-2xl font-bold cursor-pointer"
              onClick={() => router.push("/")}
            >
              {title}
            </h2>
            {windowWidth <= 768 && isOpen && (
              <PanelRightOpen onClick={() => setIsOpen(!isOpen)} size={24} />
            )}
          </div>

          <nav className="space-y-4">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="block py-2.5 px-4 rounded hover:bg-teal-500 transition"
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <nav className="space-y-4">
            <h3 className="text-lg font-bold">Chat History</h3>
            {historyIDs ? (
              historyIDs.map((item, index) => (
                <Link
                  key={index}
                  href={`/chat/c/${item.chatID}`}
                  className="block py-2.5 px-4 rounded hover:bg-teal-500 transition"
                >
                  {item.chatID.slice(0, 10) + "..."}
                </Link>
              ))
            ) : (
              <div className="animate-pulse flex flex-col space-y-4">
                <div className="h-10 bg-teal-500/50 rounded w-3/4"></div>
                <div className="h-10 bg-teal-500/50 rounded w-3/4"></div>
              </div>
            )}
          </nav>
        </div>
        <div className="bg-teal-700 px-4 py-3 flex items-center gap-3 rounded-lg">
          <UserButton />
          {user.user?.username}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
