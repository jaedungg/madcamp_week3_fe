"use client";

// components/CategoryGallery.tsx
import React from 'react';
import { Card, List } from 'antd';
import Meta from 'antd/es/card/Meta';
import { useRouter } from 'next/navigation';

const data = [
  { title: '가요', value: 1, },
  { title: 'POP', value: 2, },
  { title: 'JPOP', value: 3, },
  { title: '발라드', value: 4, },
  { title: '댄스', value: 5, },
  { title: '트로트', value: 6, },
  { title: 'OST', value: 7, },
  { title: '랩/힙합', value: 8, },
  { title: 'R&B', value: 9, },
  { title: '인디', value: 10, },
  { title: '밴드', value: 11, },
  { title: 'Jazz', value: 12, },
];

export default function CategoryGallery() {
  const router = useRouter();
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Category</h2>
      <List
        grid={{ gutter: 16, column: 6 }}
        dataSource={data}
        renderItem={(item) => (
          <List.Item>
            <div
              onClick={() => {
                console.log(`Clicked on ${item.title}`)
                router.push(`/category/${item.value}`)
              }}
              className="relative overflow-hidden rounded-lg hover:shadow-2xl transition duration-200 aspect-[3/2] cursor-pointer"
            >
              <img
                src="/images/ballade.jpeg"
                alt="preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/70 text-xl text-white text-center font-semibold">
                {item.title}
              </div>
            </div>

          </List.Item>
        )}
      />
      {/* 하단 링크 */}
      {/* <div className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
        <a href="#">See all sound effects</a>
      </div> */}
    </div>
);
}
