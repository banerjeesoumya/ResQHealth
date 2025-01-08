"use client";
import Sidebar from "@/components/shared/sidebar";
import { UserButton } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import { sidebarItems } from "@/lib/items/sidebarItems";
import axios from "axios";

type HealthCenter = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance: number;
};

const HealthCenter = () => {
  const [centerType, setCenterType] = useState<string>("healthcare");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [healthCenters, setHealthCenters] = useState<HealthCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pincode, setPincode] = useState<string>("");
  const [locationDenied, setLocationDenied] = useState<boolean>(false);

  const fetchCoordinatesFromPincode = async (pin: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pin}&countrycodes=in&format=json`,
        {
          headers: { "User-Agent": "ResQHealth/1.0 (your.email@example.com)" },
        }
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      } else {
        alert("Invalid pincode. Please try again.");
      }
    } catch (error) {
      console.error("Pincode fetch error:", error);
      alert("Failed to fetch location from pincode. Please try again.");
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setLocationDenied(true);
              alert("Location is denied. Please provide your pincode.");
            }
            reject(error);
          });
        });
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
      } catch (error) {
        console.error("Geolocation error:", error);
      }
    };

    getLocation();
  }, []);

  useEffect(() => {
    const fetchHealthCenters = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        const { latitude, longitude } = location;
        const tag = centerType === "vaccination" ? "healthcare:speciality" : "healthcare";

        const overpassQuery = `
          [out:json];
          node["${tag}"="${centerType}"](around:100000, ${latitude}, ${longitude});
          out body;
        `;

        const response = await axios.get(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
        );

        if (response.status !== 200) {
          throw new Error(`API Error: ${response.statusText}`);
        }

        const data = response.data;
        const fetchedHealthCenters = data.elements.map((element: any): HealthCenter => {
          const address = [
            element.tags["addr:full"],
            element.tags["addr:district"],
            element.tags["addr:postcode"],
            element.tags["addr:state"],
          ]
            .filter(Boolean)
            .join(", ");

          const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
          const R = 6371; // Earth's radius in kilometers
          const dLat = toRadians(element.lat - latitude);
          const dLon = toRadians(element.lon - longitude);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(latitude)) *
              Math.cos(toRadians(element.lat)) *
              Math.sin(dLon / 2) ** 2;
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          return {
            id: element.id,
            name: element.tags.name || "Unnamed Center",
            address: address || "Address not available",
            lat: element.lat,
            lon: element.lon,
            distance: parseFloat(Number(distance).toFixed(2)),
          };
        });

        setHealthCenters(fetchedHealthCenters);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to fetch health centers. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchHealthCenters();
    }
  }, [centerType, location]);

  return (
    <div className="flex h-screen">
      <Sidebar title="ResQ Health" sidebarItems={sidebarItems} />
      <main className="flex-1 p-6 lg:ml-64 md:ml-16 overflow-y-auto">
        <header className="flex justify-between items-center mb-4">
          <h1 className="text-3xl max-sm:ml-12 max-sm:w-full font-bold text-blue-600">Nearby Health Centers</h1>
          <UserButton />
        </header>

        <section className="mb-6">
          <label htmlFor="centerType" className="block text-lg font-medium text-gray-700">
            Select Health Center Type:
          </label>
          <select
            id="centerType"
            value={centerType}
            onChange={(e) => setCenterType(e.target.value)}
            className="mt-2 p-2 w-[100%] border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="vaccination">Vaccination Centers</option>
            <option value="laboratory">Laboratories</option>
            <option value="clinic">Clinics</option>
            <option value="hospital">Hospitals</option>
            <option value="pharmacy">Pharmacies</option>
          </select>
        </section>

        {locationDenied && (
          <section className="mb-6">
            <label htmlFor="pincode" className="block text-lg font-medium text-gray-700">
              Enter Pincode:
            </label>
            <input
              type="text"
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              placeholder="Enter your pincode"
              className="mt-2 p-2 w-[100%] border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => fetchCoordinatesFromPincode(pincode)}
              className="mt-4 p-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600"
            >
              Find Location
            </button>
          </section>
        )}

        {loading ? (
          <p className="text-lg text-blue-500">Loading health centers nearby...</p>
        ) : error ? (
          <p className="text-lg text-red-500">{error}</p>
        ) : healthCenters.length === 0 ? (
          <p className="text-lg text-gray-500">No health centers found nearby.</p>
        ) : (
          <ul className="space-y-4">
            {healthCenters.map((center, index) => (
              <li
                key={`${index}-${center.name}-${center.lat}-${center.lon}`}
                className="p-4 border rounded-lg shadow-md hover:shadow-lg transition bg-white"
              >
                <h2 className="text-lg font-bold text-gray-800">{center.name}</h2>
                <p className="text-gray-600">{center.address}</p>
                <p className="text-gray-500">Latitude: {center.lat}, Longitude: {center.lon}</p>
                <p className="text-blue-500 font-semibold">Distance: {center.distance} km</p>
                <a
                  href={`https://www.google.com/maps?q=${center.lat},${center.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Google Maps
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default HealthCenter;
