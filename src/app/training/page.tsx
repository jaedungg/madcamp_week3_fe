'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  message,
  List,
  Calendar,
  Tag,
  Upload,
  Typography,
  Space
} from 'antd';
import {
  YoutubeOutlined,
  RocketOutlined,
  UploadOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const SongAnalysisPage = () => {
  const [file, setFile] = useState(null);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [pitchScore, setPitchScore] = useState(0);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="w-full space-y-8 text-gray-900 dark:text-white">
      <Title level={2}>🏋️ 보컬 트레이닝</Title>

      <Card title="🔍 맞춤형 추천 루틴" bordered>
        <Space direction="vertical">
          <Paragraph>
            🎯 고음에서 음정 흔들림 개선 → <Tag color="blue">고음 발성 훈련</Tag>
          </Paragraph>
          <Paragraph>
            🎯 박자 밀림 개선 → <Tag color="purple">리듬 클랩 게임</Tag>
          </Paragraph>
        </Space>
      </Card>

      <Card title="🎥 추천 유튜브 콘텐츠" style={{ marginTop: 20 }}>
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

      <Card title="🎮 리듬 트레이닝 게임" style={{ marginTop: 20 }}>
        <Paragraph>간단한 리듬에 맞춰 박수를 치거나 소리를 내는 연습 (게임 삽입 예정)</Paragraph>
        <Button icon={<RocketOutlined />} type="primary">게임 시작</Button>
      </Card>

    </div>
  );
};

export default SongAnalysisPage;
