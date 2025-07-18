import CategoryGallery from "@/components/view/CategoryGallery";
import SongCharts from "@/components/view/SongCharts";

export default function ChartPage() {
  return (
    <div className="font-sans flex flex-col h-full w-full space-y-12">
      <SongCharts />
      <CategoryGallery />
    </div>
  );
}
