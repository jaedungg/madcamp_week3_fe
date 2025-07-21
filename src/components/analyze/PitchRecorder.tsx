'use client';

import { useEffect, useRef, useState } from 'react';
import { detectPitch } from '@/lib/util/pitchUtils'; // 오토코릴레이션 pitch detection 함수
import { Button, Card, Collapse, Progress, Typography } from 'antd';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const { Text } = Typography;

export default function PitchRecorder() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  // 실시간 데이터 추적용 ref
  const pitchDataRef = useRef<(number | null)[]>([]);
  const timeStampsRef = useRef<number[]>([]);
  const tickRef = useRef(0);
  const isRecordingRef = useRef(false);

  const [isRecording, setIsRecording] = useState(false);
  const [pitchData, setPitchData] = useState<(number | null)[]>([]);
  const [timeStamps, setTimeStamps] = useState<number[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);

  // Chart 초기화
  useEffect(() => {
    if (canvasRef.current && !chartRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: 'Pitch (Hz)',
                data: [],
                borderColor: 'blue',
                fill: false,
                pointRadius: 0,
              },
            ],
          },
          options: {
            animation: false,
            responsive: true,
            scales: {
              x: {
                title: { display: true, text: 'Time (ms)' },
              },
              y: {
                title: { display: true, text: 'Pitch (Hz)' },
                min: 50,
                max: 1000,
              },
            },
          },
        });
      }
    }
  }, []);

  const updateChart = (labels: number[], data: (number | null)[]) => {
    if (!chartRef.current) return;
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = data;
    chartRef.current.update('none');
  };

  const handleRecord = async () => {
    if (isRecording) {
      // 녹음 종료
      setIsRecording(false);
      isRecordingRef.current = false;

      // 분석용 상태에 복사
      setPitchData([...pitchDataRef.current]);
      setTimeStamps([...timeStampsRef.current]);

      analyzePitch();
      return;
    }

    // 초기화
    pitchDataRef.current = [];
    timeStampsRef.current = [];
    tickRef.current = 0;
    setAnalyzed(false);
    setFeedback([]);
    setIsRecording(true);
    isRecordingRef.current = true;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);

    const buffer = new Float32Array(analyser.fftSize);

    const loop = () => {
      if (!isRecordingRef.current) {
        audioContext.close();
        return;
      }

      analyser.getFloatTimeDomainData(buffer);
      const pitch = detectPitch(buffer, audioContext.sampleRate);

      pitchDataRef.current.push(pitch ?? null);
      timeStampsRef.current.push(tickRef.current);
      updateChart(timeStampsRef.current, pitchDataRef.current);

      tickRef.current += 50;
      requestAnimationFrame(loop);
    };

    loop();
  };

  const analyzePitch = () => {
    const cleaned = pitchDataRef.current.filter(
      (p) => p !== null && p > 50 && p < 800
    ) as number[];
    const average =
      cleaned.reduce((a, b) => a + b, 0) / cleaned.length || 0;
    const variance =
      cleaned.reduce((acc, p) => acc + Math.pow(p - average, 2), 0) /
        cleaned.length || 0;

    const result: string[] = [];
    if (average > 500)
      result.push('⚠️ 전반적으로 고음 위주입니다. 안정적인 발성이 필요해요.');
    if (variance > 2000)
      result.push('🎯 음정 흔들림이 큽니다. 발성의 일관성을 연습해보세요.');
    if (average < 200)
      result.push('📉 음정이 낮은 편입니다. 더 정확한 음정을 겨냥해보세요.');

    setFeedback(result);
    setAnalyzed(true);
  };

  return (
    <div>
      <h1 className='text-xl font-bold mb-4'>🎼 실시간 피치 분석기</h1>


      <div className='w-[80%] mx-auto mb-4'>
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          style={{ marginTop: '20px', border: '1px solid #ccc' }}
        />
      </div>

      <button 
        className={`flex flex-1 items-center bg-indigo-400 justify-center p-3 px-4 rounded-lg text-lg text-white transition cursor-pointer`}
        onClick={handleRecord}>
        {isRecording ? '녹음 종료 & 분석' : '🎙 실시간 피치 녹음'}
      </button>

      {analyzed && (
        <Card title="AI 분석 리포트" style={{ marginTop: 24 }}>
          <Progress
            percent={Math.min(100, Math.round(100 - feedback.length * 20))}
          />
          <Collapse
            defaultActiveKey={['1']}
            style={{ marginTop: 16 }}
            items={[
              {
                key: '1',
                label: '피드백 요약',
                children:
                  feedback.length > 0 ? (
                    feedback.map((line, idx) => (
                      <Text key={idx}>{line}</Text>
                    ))
                  ) : (
                    <Text type="success">
                      👏 안정적인 피치 유지! 훌륭합니다.
                    </Text>
                  ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
}
