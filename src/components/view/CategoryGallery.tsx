"use client";

// components/CategoryGallery.tsx
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
      <h2 className="text-xl font-bold mb-4">Category</h2>
      <List
        grid={{ gutter: 16, column: 6 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <div
              className="relative overflow-hidden hover:drop-shadow-md rounded-lg aspect-[3/2] p-0"
            >
              <img
                src="/images/ballade.jpeg"
                alt="preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg text-white text-center font-semibold">
                {item.title}
              </div>
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
