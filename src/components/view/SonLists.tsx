'use client';

import {
  DownloadOutlined,
  HeartOutlined,
  MoreOutlined,
  PlayCircleFilled,
} from '@ant-design/icons';
import { App, Button, List, message, Spin } from 'antd';
import { useMemo } from 'react';

interface MusicItem {
  title: string;
  artist: string;
  genre?: string;
  uuid?: string;
  rank: string;
}

interface Props {
  items: MusicItem[];
  isChart?: boolean;
  onClick: (item: any) => {}
}

const MusicList: React.FC<Props> = ({ items, isChart = false, onClick }) => {
  const [messageApi, contextHolder] = message.useMessage();

  const contentStyle: React.CSSProperties = {
    padding: 80,
    borderRadius: 12,
  };

  const content = <div style={contentStyle} />;

  return (
    <App>
      {contextHolder}
      {items.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-white" style={{ minHeight: '100%' }}>
          <Spin tip="Loading..." size="large">{content}</Spin>
        </div>
      )}
      <List
        itemLayout="horizontal"
        dataSource={items}
        loading={items.length === 0}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          className: 'mt-4',
          align: 'center',
        }}
        renderItem={(item) => (
          <List.Item
            className="bg-white px-3 py-2 rounded-md"
            onClick={() => onClick(item)}
            style={{ cursor: 'pointer' }}
            actions={[
              <Button type="text" icon={<HeartOutlined />} key="like" />,
              <Button type="text" icon={<DownloadOutlined />} key="download" />,
              <Button type="text" icon={<MoreOutlined />} key="more" />,
            ]}
          >
            <List.Item.Meta
              avatar={
                <div className="flex items-center space-x-4">
                  <PlayCircleFilled className="text-lg" />
                  {isChart &&
                  <div className="w-10 text-center text-lg font-bold text-gray-700">{item.rank}위</div>
                  }
                </div>
              }
              title={
                <div className="font-semibold text-base text-black whitespace-nowrap overflow-hidden text-ellipsis w-[350px]">
                  {item.title}
                </div>
              }
            />
            <div className="text-start text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis w-[350px]">
              <span className="text-base text-gray-600 mb-0 mr-6">{item.artist}</span>
            </div>
          </List.Item>
        )}
      />
    </App>
  );
};

export default MusicList;
