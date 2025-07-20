'use client';

import React, { useState } from 'react';
import {
  Card,
  Collapse,
  List,
  Typography,
  Progress,
  Tag,
  Row,
  Col,
} from 'antd';
import {
  BarChartOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  StarOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const SongAnalysisPage = () => {
  const [pitchScore, setPitchScore] = useState(82);
  const [rhythmScore, setRhythmScore] = useState(91);
  const [showReport, setShowReport] = useState(true);

  const overallScore = ((pitchScore + rhythmScore) / 2).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 text-gray-900 dark:text-white">
      {/* 종합 점수 대시보드 */}
      <Card className="bg-white dark:bg-neutral-900 shadow-md text-center">
        <Title level={3}>📊 종합 점수</Title>
        <Progress
          type="circle"
          percent={Number(overallScore)}
          format={(percent) => `${percent}점`}
          strokeColor={Number(overallScore) >= 85 ? '#52c41a' : '#faad14'}
        />
        <Paragraph className="mt-4">
          평균 <Text strong>{overallScore}</Text>점으로 분석되었습니다.
        </Paragraph>
      </Card>

      {/* 세부 점수 */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="🎯 음정 정확도" bordered={false}>
            <Progress percent={pitchScore} status="active" strokeColor="#722ed1" />
            <Paragraph className="mt-2">음정 유지력에 대한 평가 점수입니다.</Paragraph>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="🎯 박자 일치도" bordered={false}>
            <Progress percent={rhythmScore} status="active" strokeColor="#1890ff" />
            <Paragraph className="mt-2">리듬 감각에 대한 평가 점수입니다.</Paragraph>
          </Card>
        </Col>
      </Row>

      {/* 분석 결과 상세 */}
      {showReport && (
        <Collapse defaultActiveKey={['1']} className="bg-white dark:bg-neutral-900 rounded-lg">
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
                  <Card>
                    <Paragraph>
                      <ClockCircleOutlined className="mr-2 text-blue-500" />
                      <Text strong>{item.section}</Text> - <Tag color={item.tagColor}>{item.issue}</Tag>
                    </Paragraph>
                    <Paragraph>
                      <BulbOutlined className="mr-2 text-yellow-500" />
                      {item.suggestion}
                    </Paragraph>
                  </Card>
                </List.Item>
              )}
            />
          </Panel>

          <Panel header="🧠 AI 피드백" key="2">
            <Paragraph>🎧 후렴구의 감정 표현은 좋았지만, 고음에서 음정이 흔들리는 경향이 있어요.</Paragraph>
            <Paragraph>🎯 <Text strong>보컬 트레이닝에서 고음 발성 훈련</Text>을 추천합니다.</Paragraph>
          </Panel>

          <Panel header="📊 유사 사용자 비교" key="3">
            <UsergroupAddOutlined className="mr-2 text-green-500" />
            <Text>유사 사용자들은 <Text strong>후렴 전 구간</Text>에서 더 안정적인 음정을 유지했습니다.</Text>
          </Panel>
        </Collapse>
      )}
    </div>
  );
};

export default SongAnalysisPage;
