"use client";
import React, { createContext, useState, useContext } from "react";

interface ChatContextType {
  prompt: string | null;
  setPrompt: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}

const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [prompt, setPrompt] = useState<string | null>(null);

  return (
    <ChatContext.Provider value={{ prompt, setPrompt }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatProvider;
