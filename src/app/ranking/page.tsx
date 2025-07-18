'use client';

import { Button, Table, Avatar } from 'antd';
import { CrownFilled } from '@ant-design/icons';
import { UserOutlined } from '@ant-design/icons';

const dataSource = [
  { key: '1', rank: 1, name: '유저A', score: 98 },
  { key: '2', rank: 2, name: '유저B', score: 95 },
  { key: '3', rank: 3, name: '유저C', score: 92 },
  { key: '4', rank: 4, name: '유저D', score: 88 },
  { key: '5', rank: 5, name: '유저E', score: 85 },
];

const columns = [
  {
    title: '순위',
    dataIndex: 'rank',
    key: 'rank',
    render: (rank: number) =>
      rank === 1 ? <CrownFilled className="text-yellow-500 text-lg" /> : rank,
  },
  {
    title: '닉네임',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => (
      <div className="flex items-center gap-2">
        <Avatar src={`/avatars/${name}.png`} />
        <span>{name}</span>
      </div>
    ),
  },
  {
    title: '점수',
    dataIndex: 'score',
    key: 'score',
    render: (score: number) => <span className="font-semibold">{score}</span>,
  },
];

export default function RankingPage() {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      {/* 상단 정보 */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">🎤 노래방 랭킹</h1>
        <p className="text-gray-500">현재 124명이 참여했습니다</p>
      </div>

      {/* TOP 3 */}
      <div className="grid grid-cols-3 gap-4">
        {dataSource.slice(0, 3).map((user) => (
          <div
            key={user.key}
            className="bg-indigo-100 p-4 py-6 rounded-xl text-center shadow-md"
          >
            {/* <Avatar size={64} src={`/avatars/${user.name}.png`} /> */}
            <Avatar size={64} icon={<UserOutlined/>} />
            <h2 className="text-xl font-bold mt-2">{user.name}</h2>
            <p className="text-lg text-indigo-800 font-semibold">{user.score} 점</p>
          </div>
        ))}
      </div>

      {/* 전체 테이블 */}
      <Table
        dataSource={dataSource.slice(3)}
        columns={columns}
        pagination={false}
        bordered
      />

      {/* 하단 버튼 */}
      <div className="flex justify-center gap-4 pt-6">
        <Button type="primary">내 점수 보기</Button>
        <Button>다시 도전하기</Button>
        <Button type="link">전체 랭킹 보기</Button>
      </div>
    </div>
  );
}
