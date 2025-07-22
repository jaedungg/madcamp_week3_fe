// components/SongGallery.tsx
"use client";

import React from 'react';
import { Card, List } from 'antd';
import Meta from 'antd/es/card/Meta';

const data = [
  {
    title: '가요',

  },
  {
    title: 'POP',
  },
  {
    title: 'JPOP',
  },
  {
    title: '발라드',
  },
  {
    title: '댄스',
  },
  {
    title: '트로트',
  },
  {
    title: 'OST',
  },
  {
    title: '랩/힙합',
  },
  {
    title: 'R&B',
  },
  {
    title: '인디',
  },
  {
    title: '밴드',
  },
  {
    title: 'Jazz',
  },
];

export default function CategoryGallery() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Songs</h2>
      <List
        grid={{ gutter: 16, column: 6 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              className="rounded-md overflow-hidden"
              cover={
                <img
                  alt="example"
                  src="/images/ballade.jpeg"
                  className="object-cover h-40 w-full"
                />
              }
            >
              <Meta title="Sound name" description="Description text" />
              Wowowowoww
            </Card>
          </List.Item>
        )}
      />
    </div>
);
}
