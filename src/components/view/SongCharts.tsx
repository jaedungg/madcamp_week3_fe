'use client';

import {
  HeartOutlined,
  DownloadOutlined,
  MoreOutlined,
  PlayCircleFilled,
  FilterOutlined,
} from '@ant-design/icons';
import { App, Button, ConfigProvider, List, Tabs, message } from 'antd';
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
  const [messageApi, contextHolder] = message.useMessage();

  const handleClick = async (item: any) => {
    try {
      const query = item.artist.length > 10 ? item.title : item.title+item.artist
      const res = await fetch(`http://172.20.12.58:80/ytlink/${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.link) {
        await navigator.clipboard.writeText(data.link);
        messageApi.success(`링크 복사됨: ${item.title}`);
      } else {
        messageApi.error('링크를 찾을 수 없습니다.');
      }
    } catch (e) {
      messageApi.error('링크 가져오기 실패');
    }
  };



  return (
    <App className='relative h-full w-full'>
      {contextHolder}
      {/* 상단 탭 + 필터 */}
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
      <SonLists items={genieChart} isChart={true} onClick={handleClick} />

      {/* 하단 링크 */}
      {/* <div className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
        <a href="#">See all sound effects</a>
      </div> */}
    </App>
  );
}