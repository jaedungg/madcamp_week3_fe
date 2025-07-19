// 예시: "노래 분석하기" + "피드백 리포트" 탭 구성 (React + Ant Design)
// 필요한 라이브러리: antd, @ant-design/icons

'use client';

import React, { useState } from 'react';
import { Button, Upload, Card, Progress, Tabs, message, Collapse, List, Typography } from 'antd';
import { AudioOutlined, UploadOutlined, PlayCircleOutlined, BarChartOutlined } from '@ant-design/icons';

const { Panel } = Collapse;
const { Title, Text } = Typography;

const SongAnalysisPage = () => {
  const [pitchScore, setPitchScore] = useState(82);
  const [rhythmScore, setRhythmScore] = useState(91);
  const [showReport, setShowReport] = useState(true);

  return (
    <div >
      <h1>📑 피드백 리포트</h1>

      {showReport ? (
        <Card title="분석 요약">
          <p><BarChartOutlined /> 종합 점수: {(pitchScore + rhythmScore) / 2}점</p>
          <p>음정 정확도: {pitchScore}점</p>
          <p>박자 일치도: {rhythmScore}점</p>
        </Card>
      ) : (
        <Text type="secondary">먼저 노래 분석을 진행해 주세요.</Text>
      )}

      {showReport && (
        <Collapse defaultActiveKey={['1']} style={{ marginTop: '20px' }}>
          <Panel header="구간별 분석 결과" key="1">
            <List
              size="small"
              dataSource={[
                {
                  section: '1:00~1:20',
                  issue: '음정 흔들림',
                  suggestion: '해당 구간은 음정 정확도가 낮아요. 호흡을 일정하게 유지해보세요.'
                },
                {
                  section: '2:30~2:45',
                  issue: '박자 밀림',
                  suggestion: '가사 표현에 집중하면서 박자를 밀지 않도록 주의해보세요.'
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text>
                    ⏱ {item.section} – {item.issue}<br />
                    💡 {item.suggestion}
                  </Text>
                </List.Item>
              )}
            />
          </Panel>
          <Panel header="AI 피드백" key="2">
            <p>🎧 후렴구의 감정 표현은 좋았지만, 고음에서 음정이 흔들리는 경향이 있어요.</p>
            <p>🎯 보컬 트레이닝에서 고음 발성 훈련을 추천합니다.</p>
          </Panel>
          <Panel header="유사 사용자 비교" key="3">
            <p>당신과 유사한 점수대의 사용자들은 후렴 전 구간에서 음정 유지에 더 집중했어요.</p>
          </Panel>
        </Collapse>
      )}
    </div>
  );
};

export default SongAnalysisPage;
