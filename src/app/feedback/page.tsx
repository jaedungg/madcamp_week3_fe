'use client';
import { useUser } from '@/context/UserContext';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  Collapse,
  Typography,
  Spin,
  message,
  Tag,
  Progress,
} from 'antd';
import {
  ClockCircleOutlined,
  BulbOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

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
  artist: string; // 가수명 api필드명 주의
};

const beurl = 'http://172.20.12.58:80'; // API 서버 주소
function ScoreDashboard({
  pitchScore,
  rhythmScore,
}: {
  pitchScore: number;
  rhythmScore: number;
}) {
  const overallScore = ((pitchScore + rhythmScore) / 2).toFixed(1);
  const scoreColor =
    Number(overallScore) >= 85
      ? '#52c41a'
      : Number(overallScore) >= 70
      ? '#faad14'
      : '#f5222d';

  return (
    <Card
      className="bg-white dark:bg-neutral-900 shadow-lg text-center rounded-xl p-6 mb-6"
      style={{ maxWidth: 320, margin: '0 auto' }}
    >
      <Title level={3} className="mb-4">
        📊 종합 점수
      </Title>
      <div className="flex justify-center mb-4">
        <Progress
          type="circle"
          percent={Number(overallScore)}
          format={(percent) => `${percent}점`}
          strokeColor={scoreColor}
          size={120}
        />
      </div>
      <Paragraph className="text-lg">
        평균 <Text strong>{overallScore}</Text>점으로 분석되었습니다.
      </Paragraph>

      <div className="mt-6 space-y-3">
        <div className="flex items-center space-x-4 justify-center">
          <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            🎯 음정 정확도
          </span>
          <Progress
            percent={pitchScore}
            showInfo={false}
            strokeColor="#722ed1"
            style={{ width: 160 }}
          />
          <span className="w-10 text-right">{pitchScore}</span>
        </div>
        <div className="flex items-center space-x-4 justify-center">
          <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            🎯 박자 정확도
          </span>
          <Progress
            percent={rhythmScore}
            showInfo={false}
            strokeColor="#1890ff"
            style={{ width: 160 }}
          />
          <span className="w-10 text-right">{rhythmScore}</span>
        </div>
      </div>
    </Card>
  );
}

export default function SongAnalysisWithFeedback() {
  const { userid } = useUser();
  const [myRecords, setMyRecords] = useState<UserRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedSong, setSelectedSong] = useState<UserRecord | null>(null);

  const [feedback, setFeedback] = useState<string | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // 1) 내가 부른 노래 목록 불러오기
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

  // 2) 선택된 노래가 바뀔 때 AI 피드백 API 호출
  useEffect(() => {
    if (!selectedSong) {
      setFeedback(null);
      return;
    }

    async function fetchFeedback() {
      setLoadingFeedback(true);
      try {
        const res = await fetch(beurl + '/vocal_assessment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userid,
            musicid: selectedSong.musicid,
          }),
        });
        if (!res.ok) throw new Error('피드백 불러오기 실패: ' + res.statusText);
        const json = await res.json();
        setFeedback(json.feedback || '피드백이 없습니다.');
      } catch (e: any) {
        message.error(e.message || '피드백 불러오기 실패');
        setFeedback('피드백을 가져올 수 없습니다.');
      } finally {
        setLoadingFeedback(false);
      }
    }
    fetchFeedback();
  }, [selectedSong, userid]);

  // 내가 부른 곡 리스트 컴포넌트
  function SongList() {
    if (loadingRecords) return <Spin tip="내 노래 목록 불러오는 중..." />;

    if (!myRecords.length)
      return <Paragraph>내가 부른 노래가 없습니다.</Paragraph>;

    // musicid 기준 최신만 유지
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
              className="py-2 cursor-pointer hover:bg-cyan-50 transition rounded flex items-center gap-2"
              onClick={() => setSelectedSong(song)}
              aria-label={`곡 ${song.title} 선택`}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') setSelectedSong(song);
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

  // AI 피드백 보이는 컴포넌트 (기존 UI 재활용, loading 상태 포함)
  function FeedbackView() {
    if (!selectedSong) return null;

    return (
      <Card>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => setSelectedSong(null)}
          style={{ marginBottom: 12, fontSize: 18 }}
          aria-label="노래 리스트로 돌아가기"
        />
        <Title level={4} style={{ marginBottom: 8 }}>
          {selectedSong.title}{' '}
          <span style={{ fontSize: '1rem', color: '#888' }}>
            ({selectedSong.artist || '가수정보 없음'})
          </span>
        </Title>

        {/* 점수 박스 아래쪽 공간 추가 */}
        <div style={{ marginBottom: 24 }}>
          <ScoreDashboard
            pitchScore={selectedSong.score}
            rhythmScore={selectedSong.score}
          />
        </div>

        {/* 또는 이처럼 감싸는 div에 margin 주기 */}
        {/* <div style={{ marginBottom: 24 }}>
          <ScoreDashboard pitchScore={selectedSong.score} rhythmScore={selectedSong.score} />
        </div> */}

        {loadingFeedback ? (
          <Spin tip="피드백을 불러오는 중입니다..." />
        ) : (
          <Collapse accordion style={{ marginTop: 24 /* 추가 여백 */ }}>
            <Panel header="📍 AI 보컬 피드백" key="1">
              <Paragraph style={{ fontSize: 14, whiteSpace: 'pre-line' }}>
                {feedback || '피드백이 없습니다.'}
              </Paragraph>
            </Panel>
          </Collapse>
        )}
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-8">
      {selectedSong ? <FeedbackView /> : <SongList />}
    </div>
  );
}
