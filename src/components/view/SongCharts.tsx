'use client';

import {
  HeartOutlined,
  DownloadOutlined,
  MoreOutlined,
  PlayCircleFilled,
  FilterOutlined,
} from '@ant-design/icons';
import { Button, ConfigProvider, List, Tabs } from 'antd';
import { useState } from 'react';
import SonLists from './SonLists';

const categories = ['All', 'Jumpscare', 'Mellow', 'Happiness', 'Ambience', 'Zonk'];

interface SongChartsProps {
  genieChart: Array<{
    rank: string;
    title: string;
    artist: string;
  }>;
}

export default function SongCharts({ genieChart }: SongChartsProps) {
  const [activeTab, setActiveTab] = useState('All');



  return (
    <div className="space-y-2 h-full relative">
      {/* 상단 탭 + 필터 */}
      <h2 className="text-2xl font-bold mb-4">Charts</h2>
      {/* <div className="flex justify-between items-center space-y-2">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={categories.map((cat) => ({
            key: cat,
            label: <span className="text-base">{cat}</span>,
          }))}
        />
      </div> */}

      {/* 리스트 */}
      <SonLists items={genieChart} />

      {/* 하단 링크 */}
      {/* <div className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
        <a href="#">See all sound effects</a>
      </div> */}
    </div>
  );
}