"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/shared/sidebar";
import { sidebarItems } from "@/lib/items/sidebarItems";
import { useUser } from "@clerk/nextjs";

export default function Portal() {
  const [patientDetails, setPatientDetails] = useState<any[]>([]);
  const [docid, setDocid] = useState<string>("");
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      setDocid(user.id);
    }
  }, [user]);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const response = await fetch("/api/patient-details", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        setPatientDetails(data);
      } catch (error) {
        console.error("Failed to fetch patient details:", error);
      }
    };

    if (user?.publicMetadata.role === "doctor") {
      fetchPatientDetails();
    }
  }, [user]);

  const handleAccept = async (pid: string, docid: string) => {
    try {
      await fetch(`/api/accept`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pid, docid }),
      });
      setPatientDetails((prevDetails) =>
        prevDetails.map((patient) =>
          patient.pid === pid ? { ...patient, busy: true } : patient
        )
      );
    } catch (error) {
      console.error("Failed to accept patient:", error);
    }
  };

  const handleDelete = async (pid: string) => {
    try {
      await fetch(`/api/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pid }),
      });
      setPatientDetails((prevDetails) =>
        prevDetails.filter((patient) => patient.pid !== pid)
      );
    } catch (error) {
      console.error("Failed to delete patient:", error);
    }
  };
  return (
    <div className="flex h-screen">
      <Sidebar title="ResQ Health" sidebarItems={sidebarItems} />
      <div className="w-full flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold mb-12">Available Patients</h1>
        {user?.publicMetadata.role === "doctor" && (
          <div className="w-full max-w-4xl">
            {patientDetails.length > 0 ? (
              <ul className="space-y-4">
                {patientDetails.map((patient) => (
                  <li
                    key={patient.pid}
                    className="p-4 border rounded-lg shadow-md"
                  >
                    <p className="font-semibold">Name: {patient.pname}</p>
                    <p>Phone: {patient.phone}</p>
                    <p>Email: {patient.email}</p>
                    <p>Disorder: {patient.disorder}</p>
                    <p>Busy: {patient.busy ? "Yes" : "No"}</p>
                    <div className="mt-4 flex space-x-4">
                      <button
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => handleAccept(patient.pid, docid)}
                        disabled={patient.busy}
                      >
                        Accept
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        onClick={() => handleDelete(patient.pid)}
                      >
                        Done
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No patients available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
