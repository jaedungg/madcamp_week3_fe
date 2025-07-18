'use client';

import {
  HeartOutlined,
  DownloadOutlined,
  MoreOutlined,
  PlayCircleFilled,
  FilterOutlined,
} from '@ant-design/icons';
import { Button, List, Tabs } from 'antd';
import { useState } from 'react';

const categories = ['All', 'Jumpscare', 'Mellow', 'Happiness', 'Ambience', 'Zonk'];

const data = [...Array(5)].map((_, idx) => ({
  id: idx,
  title: `Sound name`,
  duration: '0:12',
  description: 'Confused excited crowd slight panic and distress',
  tags: ['Shocking', 'jumpscare'],
}));

export default function SongCharts() {
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="space-y-2">
      {/* 상단 탭 + 필터 */}
      <h2 className="text-xl font-bold mb-2">Charts</h2>
      <div className="flex justify-between items-center space-y-2">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          items={categories.map((cat) => ({
            key: cat,
            label: <span className="text-base">{cat}</span>,
          }))}
          className="[&_.ant-tabs-nav-list]:gap-4"
        />
        <Button icon={<FilterOutlined />} className="text-sm font-medium">
          Filter
        </Button>
      </div>

      {/* 리스트 */}
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item
            className="bg-white px-3 py-2 rounded-md"
            actions={[
              <Button type="text" icon={<HeartOutlined />} key="like" />,
              <Button type="text" icon={<DownloadOutlined />} key="download" />,
              <Button type="text" icon={<MoreOutlined />} key="more" />,
            ]}
          >
            <List.Item.Meta
              avatar={
                <Button
                  shape="circle"
                  icon={<PlayCircleFilled className="text-lg" />}
                  className="bg-blue-100 text-blue-600 border-none"
                />
              }
              title={
                <div className="font-semibold text-base text-black">
                  {item.title}
                  <div className="text-sm text-gray-500">{item.duration}</div>
                </div>
              }

            />
            

            <div className="text-sm text-gray-500 whitespace-nowrap">
              <span className="text-sm text-gray-600 mb-0 mr-6">{item.description}</span>
              <span> {item.tags.join(', ')}</span>
            </div>
          </List.Item>
        )}
      />

      {/* 하단 링크 */}
      <div className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
        <a href="#">See all sound effects</a>
      </div>
    </div>
  );
}