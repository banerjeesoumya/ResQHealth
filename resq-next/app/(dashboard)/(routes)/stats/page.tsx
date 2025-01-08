"use client";

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Sidebar from "@/components/shared/sidebar";
import Dropdown from "@/components/shared/Dropdown"; // Ensure you have this component or build a similar one.
import covidData from "@/lib/json/covid.json"; // Import your JSON file
import { sidebarItems } from "@/lib/items/sidebarItems";

// Define the structure of the JSON data
interface RegionalData {
  loc: string;
  totalConfirmed: number;
}

interface CovidDayData {
  day: string;
  regional: RegionalData[];
}

interface CovidData {
  data: CovidDayData[];
}

// Typecast the JSON import
const covidDataTyped = covidData as CovidData;

// Register the required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Page = () => {
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Initialize data from JSON
    const initializeData = () => {
      const data = covidDataTyped.data;

      // Extract unique locations from the JSON
      const allLocations = data[0]?.regional.map((region) => region.loc) || [];
      setLocations(allLocations);

      // Set initial data for the first location
      if (allLocations.length > 0) {
        setSelectedLocation(allLocations[0]);
        updateChartData(data, allLocations[0]);
      }
    };

    initializeData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Trigger a re-render by updating state
      setChartData({ ...chartData });
    };
  
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [chartData]);
  

  const updateChartData = (data: CovidDayData[], location: string) => {
    // Filter data for the selected location
    const locationData = data.map((day) => {
      const regional = day.regional.find((region) => region.loc === location);
      return {
        date: day.day,
        totalConfirmed: regional?.totalConfirmed || 0,
      };
    });

    // Prepare data for the chart
    const chartData = {
      labels: locationData.map((entry) => entry.date),
      datasets: [
        {
          label: `Total Confirmed Cases in ${location}`,
          data: locationData.map((entry) => entry.totalConfirmed),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    };

    setChartData(chartData);
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    updateChartData(covidDataTyped.data, location); // Update chart using JSON data
  };

  return (
    <div className="flex h-screen">
      <Sidebar title="ResQ Health" sidebarItems={sidebarItems} />
      <div className="w-full flex flex-col items-center p-4">
        <h1 className="text-2xl font-bold mb-12">COVID-19 Stats</h1>

        {locations.length > 0 && (
          <Dropdown
            items={locations}
            selectedItem={selectedLocation}
            onChange={handleLocationChange}
            className="mb-24"
          />
        )}

        {chartData ? (
          <div className="w-[75%] h-[300px] md:h-[350px] lg:h-[400px]">
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        
        ) : (
          <p>Loading chart data...</p>
        )}
      </div>
    </div>
  );
};

export default Page;
