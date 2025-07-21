'use client';

import React, { useState } from 'react';
import {
  Card,
  Collapse,
  List,
  Typography,
  Progress,
  Tag,
} from 'antd';
import {
  ClockCircleOutlined,
  BulbOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const SongAnalysisPage = () => {
  const [pitchScore, setPitchScore] = useState(82);
  const [rhythmScore, setRhythmScore] = useState(91);
  const [showReport, setShowReport] = useState(true);

  const overallScore = ((pitchScore + rhythmScore) / 2).toFixed(1);
  const scoreColor = Number(overallScore) >= 85 ? '#52c41a' : Number(overallScore) >= 70 ? '#faad14' : '#f5222d';

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 text-gray-900 dark:text-white">
      {/* 종합 점수 대시보드 */}
      <Card className="bg-white dark:bg-neutral-900 shadow-lg text-center rounded-xl p-6">
        <Title level={3} className="mb-4">📊 종합 점수</Title>
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

        {/* 세부 점수 */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">🎯 음정 정확도</span>
            <Progress percent={pitchScore} showInfo={false} strokeColor="#722ed1" className="flex-1" />
            <span className="w-10 text-right">{pitchScore}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">🎯 박자 정확도</span>
            <Progress percent={rhythmScore} showInfo={false} strokeColor="#1890ff" className="flex-1" />
            <span className="w-10 text-right">{rhythmScore}</span>
          </div>
        </div>
      </Card>

      {/* 분석 결과 상세 */}
      {showReport && (
        <Collapse
          defaultActiveKey={['1']}
          className="bg-white dark:bg-neutral-900 rounded-xl shadow-md"
          accordion
        >
          <Panel header="📍 구간별 분석 결과" key="1">
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={[
                {
                  section: '1:00~1:20',
                  issue: '음정 흔들림',
                  suggestion: '해당 구간은 음정 정확도가 낮아요. 호흡을 일정하게 유지해보세요.',
                  tagColor: 'volcano',
                },
                {
                  section: '2:30~2:45',
                  issue: '박자 밀림',
                  suggestion: '가사 표현에 집중하면서 박자를 밀지 않도록 주의해보세요.',
                  tagColor: 'geekblue',
                },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Card className="bg-gray-50 dark:bg-neutral-800 rounded-md">
                    <Paragraph className="mb-2">
                      <ClockCircleOutlined className="mr-2 text-blue-500" />
                      <Text strong>{item.section}</Text> - <Tag color={item.tagColor}>{item.issue}</Tag>
                    </Paragraph>
                    <Paragraph className="text-sm text-gray-700 dark:text-gray-300">
                      <BulbOutlined className="mr-2 text-yellow-500" />
                      {item.suggestion}
                    </Paragraph>
                  </Card>
                </List.Item>
              )}
            />
          </Panel>

          <Panel header="🧠 AI 피드백" key="2">
            <Paragraph className="text-sm text-gray-700 dark:text-gray-300">
              🎧 후렴구의 감정 표현은 좋았지만, 고음에서 음정이 흔들리는 경향이 있어요.
            </Paragraph>
            <Paragraph className="text-sm text-gray-700 dark:text-gray-300">
              🎯 <Text strong>보컬 트레이닝에서 고음 발성 훈련</Text>을 추천합니다.
            </Paragraph>
          </Panel>
        </Collapse>
      )}
    </div>
  );
};

export default SongAnalysisPage;
