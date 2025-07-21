'use client';

import { use, useEffect, useRef, useState } from 'react';
import { detectPitch } from '@/lib/util/pitchUtils'; // 오토코릴레이션 pitch detection 함수
import { Button, Card, Collapse, Progress, Typography } from 'antd';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const { Text } = Typography;

interface PitchRecorderProps {
  uuid: string | null;
  audioUrl: string | null;
}

export default function PitchRecorder({uuid, audioUrl} : PitchRecorderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  // 실시간 데이터 추적용 ref
  const pitchDataRef = useRef<(number | null)[]>([]);
  const timeStampsRef = useRef<number[]>([]);
  const tickRef = useRef(0);
  const isRecordingRef = useRef(false);
  // 오디오 재생
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 가사 표시
  const [currentLyric, setCurrentLyric] = useState<string>('');
  const lyricsRef = useRef<{ start: number; duration: number; text: string }[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [pitchData, setPitchData] = useState<(number | null)[]>([]);
  const [originalPitch, setOriginalPitch] = useState<(number | null)[]>([]);
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
                label: 'Live Pitch (Hz)',
                data: [],
                borderColor: 'blue',
                fill: false,
                pointRadius: 0,
              },
              {
                label: 'Original Pitch (Hz)',
                data: [],
                borderColor: 'orange',
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
                min: 0,
                max: 1500,
              },
            },
          },
        });
      }
    }
  }, []);

  const updateChart = (labels: number[], liveData: (number | null)[]) => {
    if (!chartRef.current) return;

    // 그래프 스케일링
    // const now = audioRef.current?.currentTime ?? 0;
    // const minX = now * 1000 - 1000;
    // const maxX = now * 1000 + 5000;
    const nowTick = tickRef.current;
    const minX = nowTick - 10000;
    const maxX = nowTick + 50000;

    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = liveData;
  
    // 원곡 pitch 길이가 liveData보다 짧으면 나머지는 null로 채우기
    const originalData = [...originalPitch];
    while (originalData.length < labels.length) {
      originalData.push(null);
    }
    chartRef.current.data.datasets[1].data = originalData;
    
    // 그래프 스케일링
    chartRef.current.options!.scales!.x!.min = minX;
    chartRef.current.options!.scales!.x!.max = maxX;
  
    chartRef.current.update('none');
  };

  const handleRecord = async () => {
    if (isRecording) {
      // 녹음 종료
      setIsRecording(false);
      isRecordingRef.current = false;

      // 오디오 정지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
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

    // 오디오 재생 시작
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => {
        console.error('오디오 재생 오류:', err);
      });
    }
    
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

  console.log('PitchRecorder mounted with uuid:', uuid, 'audioUrl:', audioUrl);

  const fetchAudioData = async () => {
    const response = await fetch('/api/music_meta/' + uuid, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch audio data');
    }
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    if (uuid && audioUrl) {
      console.log('Fetching audio data for uuid:', uuid);
      fetchAudioData()
        .then((data) => {
          console.log('Audio data fetched: ', data);
          lyricsRef.current = JSON.parse(data.lyrics);
          setOriginalPitch(data.pitch_vector.slice(0));
        })
        .catch((error) => {
          console.error('Error fetching audio data:', error);
        });
    }
  }, [uuid, audioUrl]);

  // 현재 오디오 시간에 맞춰 가사 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      if (!audioRef.current) return;
  
      const currentTime = audioRef.current.currentTime;
      const current = lyricsRef.current.find(
        (line) =>
          currentTime >= line.start &&
          currentTime <= line.start + line.duration
      );
  
      setCurrentLyric(current?.text ?? '');
    }, 100); // 100ms 단위로 확인
  
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className='text-xl font-bold mb-4'>🎼 실시간 피치 분석기</h1>
      <audio ref={audioRef} src={audioUrl ?? undefined} />

      <div className='w-[80%] mx-auto mb-4'>
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          style={{ marginTop: '20px', border: '1px solid #ccc' }}
        />
      </div>

      {currentLyric && (
        <div> 
        {/* <div 
        className="text-center my-4 text-2xl font-bold transition-all duration-200 animate-pulse text-white drop-shadow-lg drop-shadow-indigo-500">
          {currentLyric}
        </div>  */}
        <h1
          className="text-center my-4 text-2xl font-bold text-white drop-shadow-sm drop-shadow-indigo-500"
          style={{
            textShadow: `-1px -1px 0 #6366F1,
                         1px -1px 0 #6366F1,
                        -1px  1px 0 #6366F1,
                         1px  1px 0 #6366F1`
          }}
        >
          {currentLyric}
        </h1>
        </div>
        
      )}

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
