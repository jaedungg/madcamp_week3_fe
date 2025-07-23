'use client';

import CategoryGallery from "@/components/view/CategoryGallery";
import SongCharts from "@/components/view/SongCharts";
import SonLists from "@/components/view/SonLists";
import { App, message } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MusicItem {
  title: string;
  artist: string;
  genre: string;
  uuid: string;
  rank: string;
}

function convertToMusicItems(data: (string | null)[][]): MusicItem[] {
  return data
    .filter(item => item.length >= 6) // 안전하게 최소 길이 체크
    .sort((a, b) => {
      const dateA = new Date(a[5] ?? "").getTime();
      const dateB = new Date(b[5] ?? "").getTime();
      return dateB - dateA; // 최신순
    })
    .map(item => ({
      uuid: item[0] ?? "",
      title: item[1] ?? "",
      artist: item[2] ?? "",
      genre: item[3] ?? "",
      rank: ""  // 추후 랭킹 계산 시 업데이트
    }));
}

export default  function ChartPage() {
  const [allMusics, setAllMusics] = useState<MusicItem[] | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const route = useRouter();

  const fetchAllMusics = async () => {
    try {
      const res = await fetch('/api/all_musics');
      const rawData = await res.json(); // rawData: (string | null)[][]
      const musicItems = convertToMusicItems(rawData);
      console.log('All musics data:', musicItems);
      return musicItems;
    } catch (error) {
      console.error('Error fetching All musics data:', error);
      return [];
    }
  };

  useEffect (() => {
    if (allMusics == null) {
      console.log('Fetching Genie chart data...');
      fetchAllMusics().then(setAllMusics);
    }
  }, []);

  const handleClick = async (item: any) => {
    route.push(`/analyze/${item.uuid}`)
  };

  return (
    <div className="relative font-sans flex flex-col h-full w-full space-y-12">
      <App className="h-full w-full">
        {contextHolder}
          <h2 className="text-2xl font-bold mb-4">Recently uploaded</h2>
          <div className="h-full">
            <SonLists items={allMusics} onClick={handleClick}/>
        </div>
      </App>
    </div>
  );
}
