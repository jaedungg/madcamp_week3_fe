'use client';

import { useSession } from 'next-auth/react';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Table,
  Collapse,
  Typography,
  Spin,
  message,
  Tag,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CrownFilled,
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Paragraph } = Typography;

type UserRecord = {
  recordid: number;
  userid: string;
  musicid: string;
  score: number;
  audio_url: string;
  pitch_vector: string;
  onset_times: string;
  created_at: string;
  title: string;
  artist: string;
};

const beurl = 'http://172.20.12.58:80';

const columns = [
  {
    title: '순위',
    dataIndex: 'ranking',
    key: 'ranking',
    render: (ranking: number) =>
      ranking === 1 ? (
        <CrownFilled style={{ color: '#faad14', fontSize: 16 }} />
      ) : (
        ranking
      ),
    width: 60,
    align: 'center' as const,
  },
  {
    title: '닉네임',
    dataIndex: 'userid',
    key: 'userid',
    render: (userid: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <UserOutlined />
        <span>{userid}</span>
      </div>
    ),
    width: 120,
  },
  {
    title: '점수',
    dataIndex: 'score',
    key: 'score',
    render: (score: number) => <span style={{ fontWeight: 600 }}>{score}</span>,
    width: 80,
    align: 'center' as const,
  },
];

export default function UserSongsAndRankingPage() {
  const { data: session, status } = useSession();

  const [myRecords, setMyRecords] = useState<UserRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null);
  const [ranking, setRanking] = useState<
    Array<{ key: string; ranking: number; userid: string; score: number }>
  >([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // 세션 로딩중 표시
  // if (status === 'loading')
  //   return (
  //     <div style={{ textAlign: 'center', marginTop: 100 }}>
  //       <Spin size="large" />
  //       <div>세션 로딩중...</div>
  //     </div>
  //   );

  // 세션 없거나 userid 없으면 로그인 필요 메시지

  const userid = session?.user?.userid;
  console.log(userid);
  useEffect(() => {
    if (!userid) return;
    async function fetchMyRecords() {
      setLoadingRecords(true);
      try {
        const res = await fetch(beurl + '/userid_record_info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // 필요하면 credentials 포함 (fetch 기본은 제외)
            // credentials: 'include'
          },
          body: JSON.stringify({ userid }),
        });
        if (!res.ok) throw new Error('기록 불러오기 실패: ' + res.statusText);
        const data = await res.json();
        setMyRecords(data);
      } catch (e: any) {
        message.error(e.message || '불러오기 실패');
      } finally {
        setLoadingRecords(false);
      }
    }
    fetchMyRecords();
  }, [userid]);

  useEffect(() => {
    if (!selectedSongId) {
      setRanking([]);
      return;
    }

    async function fetchRanking() {
      setLoadingRanking(true);
      try {
        const res = await fetch(
          beurl + `/ranks/${encodeURIComponent(selectedSongId)}`
        );
        if (!res.ok) throw new Error('랭킹 불러오기 실패: ' + res.statusText);
        const data = await res.json();
        setRanking(data);
      } catch (e: any) {
        message.error(e.message || '랭킹 불러오기 실패');
      } finally {
        setLoadingRanking(false);
      }
    }

    fetchRanking();
  }, [selectedSongId]);

  function SongList() {
    if (loadingRecords)
      return (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Spin />
          <div style={{ marginTop: 12, color: '#888' }}>
            내 노래 목록 불러오는 중...
          </div>
        </div>
      );
    if (!myRecords.length)
      return <Paragraph>내가 부른 노래가 없습니다.</Paragraph>;

    const uniqueSongs: { [key: string]: UserRecord } = {};
    myRecords.forEach((rec) => {
      const key = rec.musicid;
      if (
        !uniqueSongs[key] ||
        new Date(rec.created_at) > new Date(uniqueSongs[key].created_at)
      ) {
        uniqueSongs[key] = rec;
      }
    });

    const songList = Object.values(uniqueSongs).sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
      <Card>
        <Title level={3}>🎶 내가 부른 노래 (최근순)</Title>
        <div className="divide-y" style={{ fontSize: 15 }}>
          {songList.map((song) => (
            <div
              key={song.musicid}
              className="py-2 cursor-pointer hover:bg-indigo-50 transition rounded flex items-center gap-2"
              onClick={() => setSelectedSongId(song.musicid)}
              aria-label={`곡 ${song.title} 선택`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSelectedSongId(song.musicid);
              }}
            >
              <div className="font-bold" style={{ minWidth: 55 }}>
                {song.title}
              </div>
              <div className="text-sm text-gray-400 ml-2">
                {song.artist || '가수정보 없음'}
              </div>
              <div className="text-xs text-gray-400 ml-3">
                {new Date(song.created_at).toLocaleDateString()}
              </div>
              <Tag color="blue" className="ml-auto mr-0">
                내 점수 {song.score}
              </Tag>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  function RankingView() {
    const selectedSong =
      myRecords.find((r) => r.musicid === selectedSongId) || null;

    return (
      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            onClick={() => setSelectedSongId(null)}
            style={{ fontSize: 18 }}
            aria-label="이전 화면으로 돌아가기"
          />
          <div>
            <Title
              level={4}
              style={{
                display: 'inline',
                margin: 0,
                fontWeight: 700,
                fontSize: 19,
              }}
            >
              {selectedSong?.title || '노래'}
            </Title>{' '}
            <span style={{ marginLeft: 8, color: '#888', fontSize: 15 }}>
              {selectedSong?.artist ?? ''}
            </span>
            <Tag color="green" style={{ marginLeft: 10, fontSize: 12 }}>
              내 점수 {selectedSong?.score ?? '-'}
            </Tag>
          </div>
        </div>
        {loadingRanking ? (
          <Spin tip="랭킹 로딩 중..." />
        ) : (
          <Table
            dataSource={ranking}
            columns={columns}
            pagination={false}
            bordered
            size="small"
            locale={{ emptyText: '랭킹 데이터가 없습니다.' }}
            rowKey={(record) => record.key}
          />
        )}
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-3 space-y-8">
      {selectedSongId === null ? <SongList /> : <RankingView />}
    </div>
  );
}
