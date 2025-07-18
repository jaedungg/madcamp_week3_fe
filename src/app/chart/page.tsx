import CategoryGallery from "@/components/view/CategoryGallery";
import SongCharts from "@/components/view/SongCharts";
import Image from "next/image";

export default function ChartPage() {
  return (
    <div className="font-sans flex flex-col h-full space-y-12">
      <SongCharts />
      <CategoryGallery />
    </div>
  );
}
