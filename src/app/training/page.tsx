'use client';

// 예시: "노래 분석하기" + "피드백 리포트" + "보컬 트레이닝" 탭 구성 (React + Ant Design)

import React, { useState } from 'react';
import {
  Button,
  Card,
  message,
  List,
  Calendar,
  Tag,
} from 'antd';
import {
  YoutubeOutlined,
  RocketOutlined
} from '@ant-design/icons';

const SongAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [pitchScore, setPitchScore] = useState(0);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [showReport, setShowReport] = useState(false);

  const handleUpload = (info: { file: { status: string; name: any; originFileObj: React.SetStateAction<null>; }; }) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} 업로드 완료`);
      setFile(info.file.originFileObj);
    }
  };

  const handleAnalyze = () => {
    if (!file) {
      message.warning('분석할 음원을 먼저 업로드해주세요.');
      return;
    }
    setAnalysisStarted(true);

    setTimeout(() => {
      setPitchScore(82);
      setRhythmScore(91);
      setShowReport(true);
    }, 2000);
  };

  return (
    <div>
      <h2>🏋️ 보컬 트레이닝</h2>

      <Card title="🔍 맞춤형 추천 루틴" bordered>
        <p>🎯 고음에서 음정 흔들림 개선 → <Tag color="blue">고음 발성 훈련</Tag></p>
        <p>🎯 박자 밀림 개선 → <Tag color="purple">리듬 클랩 게임</Tag></p>
      </Card>

      <Card title="🎥 추천 유튜브 콘텐츠" style={{ marginTop: '20px' }}>
        <List
          dataSource={[
            { title: '고음 발성 훈련', url: 'https://www.youtube.com/watch?v=example1' },
            { title: '박자 맞추기 리듬 훈련', url: 'https://www.youtube.com/watch?v=example2' }
          ]}
          renderItem={item => (
            <List.Item>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <YoutubeOutlined /> {item.title}
              </a>
            </List.Item>
          )}
        />
      </Card>

      <Card title="🎮 리듬 트레이닝 게임" style={{ marginTop: '20px' }}>
        <p>간단한 리듬에 맞춰 박수를 치거나 소리를 내는 연습 (게임 삽입 예정)</p>
        <Button icon={<RocketOutlined />} type="primary">게임 시작</Button>
      </Card>

      <Card title="📅 훈련 캘린더" style={{ marginTop: '20px' }}>
        <p>훈련 계획을 캘린더에 기록하고 성취도를 추적하세요!</p>
        <Calendar fullscreen={false} />
      </Card>
    </div>
  );
};

export default SongAnalysisPage;
