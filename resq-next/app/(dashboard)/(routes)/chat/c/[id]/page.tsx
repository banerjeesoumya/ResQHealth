"use client";
import { Message, useChat } from "ai/react";
import { useRef, useState, useEffect, useContext, FormEvent, use } from "react";
import Image from "next/image";
import { Html5Qrcode } from "html5-qrcode";
import { ChatContext } from "../../../../../../context/ChatContext";
import { useParams } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

export default function Chat() {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);

  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    maxSteps: 5,
    initialMessages,
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const params = useParams();

  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("chat data not found");
  }
  const { prompt, setPrompt } = context;

  const startScanner = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ video: true });
      }
    } catch (err) {
      console.error("Camera permission denied:", err);
      return;
    }

    const scanner = new Html5Qrcode("reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" }, // Use the back camera
        {
          fps: 10, // Frame per second
          qrbox: { width: 250, height: 250 }, // Scanning box size
        },
        (decodedText) => {
          handleInputChange({
            target: {
              value:
                "Product code is " + decodedText + ", is it harmful or not?",
            },
          } as React.ChangeEvent<HTMLInputElement>); // Append to the input field
          stopScanner();
        },
        (errorMessage) => {
          console.log("Scanning error:", errorMessage);
        }
      )
      .catch((err) => console.error("Scanner initialization error:", err));
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        scannerRef.current = null;
        setIsScanning(false);
      });
    }
  };

  const { user } = useUser();
  const { userId } = useAuth();

  // First useEffect for access check
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const response = await fetch("/api/access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatID: params.id,
            username: user?.username,
            userID: user?.id,
          }),
        });

        const data = await response.json();
        if (!data.hasAccess) {
          alert("You do not have access to this chat");
        } else {
          const history = data.history.map((message: any, index: number) => ({
            id: index.toString(),
            role: message.role,
            content: message.content,
            //experimental_attachments: message.experimental_attachments
          }));
          setInitialMessages((prevMessages) => [...prevMessages, ...history]);
          console.log("Chat history loaded:", data.history);
        }
      } catch (error) {
        console.error("Access check failed:", error);
        alert("Failed to verify chat access");
      }
    };

    if (!prompt) {
      checkAccess();
    }
  }, [params.id, user, prompt]); // Only run when user or chat ID changes

  // Second useEffect for prompt handling
  useEffect(() => {
    if (prompt) {
      append(
        { role: "user", content: prompt },
        {
          experimental_attachments: files,
          body: {
            chatID: params.id,
            userID: user?.id,
          },
          data: {
            "chatID from data": params.id,
          },
        }
      );
      setPrompt(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, append, user]); // Only run when prompt changes

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.length > 0 ? (
        messages.map((m) => (
          <div key={m.id} className="whitespace-pre-wrap">
            {m.role === "user" ? (
              <span className="font-bold text-blue-500">User:</span>
            ) : (
              <span className="font-bold text-green-500">AI:</span>
            )}{" "}
            {m.content || "Generating response..."}
            <div>
              {m.experimental_attachments &&
                m.experimental_attachments
                  .filter((attachment) =>
                    attachment?.contentType?.startsWith("image/")
                  )
                  .map((attachment, index) => (
                    <Image
                      key={`${m.id}-${index}`}
                      src={attachment.url}
                      width={500}
                      height={500}
                      alt={attachment.name ?? `attachment-${index}`}
                    />
                  ))}
            </div>
          </div>
        ))
      ) : (
        <div>Loading chats...</div>
      )}

      <form
        className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"
        onSubmit={(event) => {
          handleSubmit(event, {
            experimental_attachments: files,
            body: {
              chatID: params.id,
              userID: user?.id,
            },
            data: {
              "chatID from data": params.id,
            },
          });

          setFiles(undefined);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
      >
        <input
          type="file"
          className=""
          onChange={(event) => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          className="w-full p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
        <button
          type="button"
          className="w-full p-2 bg-blue-500 text-white rounded mt-2"
          onClick={isScanning ? stopScanner : startScanner}
        >
          {isScanning ? "Stop Scanning" : "Start Barcode Scanner"}
        </button>
        <div id="reader" className="mt-2" />
      </form>
    </div>
  );
}
