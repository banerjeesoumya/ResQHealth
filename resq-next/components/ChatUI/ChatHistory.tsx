"use client";
import { Message, useChat } from "ai/react";
import { useRef, useState, useEffect, useContext } from "react";
import Image from "next/image";
import { Html5Qrcode } from "html5-qrcode";
import { ChatContext } from "@/context/ChatContext";
import { useParams } from "next/navigation";
import { sidebarItems } from "@/lib/items/sidebarItems";
import Sidebar from "@/components/shared/sidebar";
import { ScanLine, Send, Upload, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { cn } from "@/lib/utils";

interface ChatHistory {
  chatID: string;
}

interface SerializableUser {
    username: string | null;
    id: string | null;
  }

interface ChatClientProps {
    User: SerializableUser | null;
  }

export default function ChatHistory({User}:ChatClientProps) {
  const [initialMessages, setInitialMessages] = useState<Message[]>([]);
    const [historyIDs, setHistoryIDs] = useState<ChatHistory[] | null>(null);

  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    maxSteps: 5,
    initialMessages,
  });

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(true); 
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


  // First useEffect for access check
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoadingAccess(true)
        const response = await fetch("/api/access", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chatID: params.id,
            username: User?.username,
            userID: User?.id,
          }),
        });

        const data = await response.json();
        console.log(data)
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
      finally {
        setLoadingAccess(false)
      }
    };

    if (!prompt) {
      checkAccess();
    }
  }, [params.id, prompt, User?.username, User?.id]); // Only run when user or chat ID changes

  // Second useEffect for prompt handling
  useEffect(() => {
    if (prompt) {
      append(
        { role: "user", content: prompt },
        {
          experimental_attachments: files,
          body: {
            chatID: params.id,
            userID: User?.id,
          },
          data: {
            "chatID from data": params.id,
          },
        }
      );
      setPrompt(null);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt,params.id, append, User]); // Only run when prompt changes

  const getHistoryIDs = async () => {
   
    const userID = User?.id;
    const response = await fetch("/api/chat-history-ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userID }),
    });
    const data = await response.json();
    return data.chatIDs;
  };

  useEffect(() => {
    const fetchHistoryIDs = async () => {
      const historyIDs = await getHistoryIDs();
      console.log("History IDs:", historyIDs);
      setHistoryIDs(historyIDs);
    };
    fetchHistoryIDs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files)
    } 
  };

  // Handle removing a file by index
  const handleRemoveFile = (index: number) => {
    if (!files) return;

    // Convert FileList to an array, filter out the file, and recreate a FileList
    const updatedFiles = Array.from(files).filter((_, i) => i !== index);
    const dataTransfer = new DataTransfer(); // Utility to create a new FileList

    updatedFiles.forEach((file) => dataTransfer.items.add(file));
    setFiles(dataTransfer.files); // Set updated FileList
  };
  if (loadingAccess) {
    return <div>Loading access permissions...</div>; // Show loading state
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        title="ResQ Health"
        sidebarItems={sidebarItems}
        historyIDs={historyIDs}
      />
      <div className="flex flex-col w-full max-w-3xl mx-auto bg-white shadow-lg">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                "flex",
                m.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <Card
                className={cn(
                  "max-w-[80%] p-4",
                  m.role === "user"
                    ? "bg-teal-600 text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                {m.experimental_attachments?.map((attachment, index) => {
  const isImage = attachment?.contentType?.startsWith("image/");
  const isPDF = attachment?.contentType === "application/pdf";

  return (
    <div key={index} className="mt-2 rounded-lg overflow-hidden">
      {isImage && (
        <Image
          src={attachment.url}
          width={300}
          height={300}
          alt={attachment.name ?? `attachment-${index}`}
          className="object-cover"
        />
      )}
      {isPDF && (
        <iframe
          src={attachment.url}
          className="w-full h-96 border"
          title={attachment.name ?? `attachment-${index}`}
        ></iframe>
      )}
      {!isImage && !isPDF && (
        <div className="mt-2">
          <a
            href={attachment.url}
            download={attachment.name}
            className="text-blue-500 underline"
          >
            Download {attachment.name ?? `attachment-${index}`}
          </a>
        </div>
      )}
    </div>
  );
})}

              </Card>
            </div>
          ))}
        </div>

        <div className="border-t bg-background p-4 space-y-4">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              handleSubmit(event, {
                experimental_attachments: files,
                body: {
                  chatID: params.id,
                  userID: User?.id,
                },
                data: {
                  "chatID from data": params.id,
                },
              })
              setFiles(undefined)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
          >
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                multiple
                ref={fileInputRef}
              />

{files && files.length > 0 && (
      <div className="space-y-2">
{Array.from(files)
      .slice(0, 3)
      .map((file, index) => (
          <div
            key={index}
 className="relative bg-gray-100 border rounded-md p-4 flex flex-col items-start sm:flex-row sm:items-center gap-2 w-full sm:w-auto"
          >
            {file.type.startsWith("image/") && (
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={50}
                height={50}
                className="object-cover rounded-md"
              />
            )}
            <div className="flex flex-col space-y-1">
          <span className="font-medium break-all">
            {file.name.length > 25 ? `${file.name.slice(0, 25)}...` : file.name}
          </span>
          <span className="text-gray-600 text-xs">{(file.size / 1024).toFixed(2)} KB</span>
        </div>
        <button
          type="button"
          onClick={() => handleRemoveFile(index)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
          </div>
        ))}
          {Array.from(files).length > 3 && (
      <div className="text-sm text-gray-500">
        +{Array.from(files).length - 3} more file{Array.from(files).length - 3 > 1 ? "s" : ""}
      </div>
    )}
      </div>
    )}
              <Input
                className="flex-1 min-w-[50%]"
                value={input}
                placeholder="Type your message..."
                onChange={handleInputChange}
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={isScanning ? stopScanner : startScanner}
            >
              <ScanLine className="h-4 w-4 mr-2" />
              {isScanning ? "Stop Scanner" : "Scan Barcode"}
            </Button>
          </form>
          <div id="reader" className="mt-2" />
        </div>
      </div>
    </div>
  );
}
