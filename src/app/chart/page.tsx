'use client';

import CategoryGallery from "@/components/view/CategoryGallery";
import SongCharts from "@/components/view/SongCharts";
import { useEffect, useState } from "react";

export default  function ChartPage() {
  const [chartData, setChartData] = useState([]);

  const fetchGenieChart = async () => {
    try {
      const res = await fetch('/api/genie-chart');
      const chart = await res.json();
      console.log('Genie chart data:', chart);
      return chart;
    } catch (error) {
      console.error('Error fetching Genie chart:', error);
      return [];
    }
  };
  useEffect (() => {
    if (chartData.length === 0) {
      console.log('Fetching Genie chart data...');
      fetchGenieChart().then(setChartData);
    }
  }, []);

  return (
    <div className="font-sans flex flex-col h-screen w-full space-y-12">
      <SongCharts genieChart={chartData}/>
      <CategoryGallery />
    </div>
  );
}
