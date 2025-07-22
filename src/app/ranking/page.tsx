'use client';
import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Avatar,
  Card,
  Typography,
  Tag,
  Spin,
  message,
} from 'antd';
import {
  CrownFilled,
  UserOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

type UserRecord = {
  recordid: number;
  userid: string;
  musicid: string; // string으로 변경
  score: number;
  audio_url: string;
  pitch_vector: string;
  onset_times: string;
  created_at: string;
  title: string; // 곡명
  artist: string; // 가수명
};

const columns = [
  {
    title: '순위',
    dataIndex: 'ranking', // api에서 순위 필드는 'ranking' 입니다.
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
    dataIndex: 'userid', // api에서는 닉네임 대신 userid 필드를 사용합니다.
    key: 'userid',
    render: (userid: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Avatar size="small" icon={<UserOutlined />} />
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
const beurl = 'http://172.20.12.58:80';
export default function UserSongsAndRankingPage() {
  const { userid } = useUser();
  const [myRecords, setMyRecords] = useState<UserRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState<string | null>(null); // string

  const [ranking, setRanking] = useState<
    Array<{ key: string; ranking: number; userid: string; score: number }>
  >([]);
  const [loadingRanking, setLoadingRanking] = useState(false);

  // 내가 부른 노래 리스트 가져오기 (userid 기준 전체 데이터)
  useEffect(() => {
    async function fetchMyRecords() {
      setLoadingRecords(true);
      try {
        const res = await fetch(beurl + '/userid_record_info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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

  // 선택된 곡의 랭킹 가져오기
  useEffect(() => {
    if (selectedSongId === null) return;

    async function fetchRanking() {
      setLoadingRanking(true);
      try {
        // GET 방식인데 body는 서버에 따라 안 받기도 하니 query param 예로 변경 가능
        const res = await fetch(
          beurl + `/ranks/${encodeURIComponent(selectedSongId as string)}`
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

  // 내가 부른 곡 리스트 컴포넌트
  function SongList() {
    if (loadingRecords) return <Spin tip="로딩중..." />;

    if (myRecords.length === 0)
      return <Paragraph>내가 부른 노래가 없습니다.</Paragraph>;

    // musicid 기준 최신 레코드만 남김
    const uniqueSongs: { [key: string]: UserRecord } = {};
    myRecords.forEach((rec) => {
      const key = rec.musicid;
      if (
        !uniqueSongs[key] ||
        new Date(rec.created_at) > new Date(uniqueSongs[key].created_at)
      )
        uniqueSongs[key] = rec;
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
            >
              <div className="font-bold" style={{ minWidth: 55 }}>
                {song.title}
              </div>
              <span className="text-sm text-gray-400 ml-2">
                {song.artist || '가수정보 없음'}
              </span>
              <span className="text-xs text-gray-400 ml-3">
                {new Date(song.created_at).toLocaleDateString()}
              </span>
              <Tag color="blue" className="ml-auto mr-0">
                내 점수 {song.score}
              </Tag>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // 랭킹 보여주는 컴포넌트
  function RankingView() {
    const selectedSong =
      myRecords.find((r) => r.musicid === selectedSongId) ?? null;

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
