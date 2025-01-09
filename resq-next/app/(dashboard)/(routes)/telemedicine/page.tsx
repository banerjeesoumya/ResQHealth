"use client";
import { useState, useEffect, useRef, FormEvent, use } from "react";
import { useChat } from "ai/react";
import Image from "next/image";
import Sidebar from "@/components/shared/sidebar";
import { sidebarItems } from "@/lib/items/sidebarItems";

export default function Telemedicine() {
  const [doctorDetails, setDoctorDetails] = useState<any>(null);
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");

  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    maxSteps: 5,
    api: "/api/telemedicine",
  });

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch("/api/doctor-details", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setDoctorDetails(data);
      } catch (error) {
        console.error("Failed to fetch doctor details:", error);
      }
    };

    fetchDoctorDetails();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar title="ResQ Health" sidebarItems={sidebarItems} />
      <div className="w-full flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold mb-12">Telemedicine</h1>
        <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
          <div className="mb-4 p-4 border border-gray-300 rounded shadow-md">
            {doctorDetails ? (
              <div>
                <h2 className="text-xl font-bold">Doctor Details</h2>
                <p>Name: {doctorDetails.name}</p>
                <p>Email: {doctorDetails.email}</p>
                <p>Phone: {doctorDetails.phone}</p>
                <p>Area of Specialization: {doctorDetails.aos}</p>
              </div>
            ) : (
              <div>Fetching doctor details...</div>
            )}
          </div>

          <form
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl space-y-2"
            onSubmit={(event) => {
              handleSubmit(event, {
                experimental_attachments: files,
                body: {
                  email: email,
                  name: name,
                  phone: phone,
                },
              });

              //setFiles(undefined);

              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                if (event.target.files) {
                  setFiles(event.target.files);
                }
              }}
              ref={fileInputRef}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <input
              className="w-full p-2 border border-gray-300 rounded"
              value={input}
              placeholder="Any do you want to know..."
              onChange={handleInputChange}
              required
            />
            <button
              type="submit"
              className="w-full p-2 bg-blue-500 text-white rounded mt-2"
            >
              Upload Prescription
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
