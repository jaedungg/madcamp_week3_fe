'use client';

import { Dispatch, SetStateAction, use, useEffect, useRef, useState } from 'react';
import { detectPitch } from '@/lib/util/pitchUtils'; // 오토코릴레이션 pitch detection 함수
import { Button, Card, Collapse, Progress, Typography } from 'antd';
import { AudioOutlined, AudioFilled, StopOutlined } from '@ant-design/icons';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const { Text } = Typography;

interface PitchRecorderProps {
  uuid: string | null;
  audioUrl: string | null;
  setUserAudioUrlAction: Dispatch<SetStateAction<string | null>>;
}

export default function PitchRecorder({uuid, audioUrl, setUserAudioUrlAction} : PitchRecorderProps) {
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
  // 유저 노래 녹음
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [pitchData, setPitchData] = useState<(number | null)[]>([]);
  const [originalPitch, setOriginalPitch] = useState<(number | null)[]>([]);
  const [originalNotes, setOriginalNotes] = useState<(number | null)[]>([]);
  const [timeStamps, setTimeStamps] = useState<number[]>([]);

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
                borderColor: 'lightgray',
                fill: false,
                pointRadius: 0,
              },
            ],
          },
          options: {
            animation: false,
            responsive: true,
            plugins: {
              legend: {
                display: false,
                labels: {
                  color: '#333',
                  font: { size: 12 }
                }
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#666',
                  font: { size: 10 },
                  maxTicksLimit: 2, // ❗ 눈금 수 제한
                  // callback: (value) => `${(Number(value) / 1000).toFixed(1)}s`, // 숫자 포맷
                  callback: (value) => `${value}s`, // 숫자 포맷
                },
                title: {
                  display: false, // ❌ 제목 숨김
                },
              },
              y: {
                grid: {
                  display: false, // ❌ 가로선 안보이게
                },
                ticks: {
                  display: false,
                },
                title: {
                  display: false, // ❌ 제목 숨김
                },
                min: 0,
                max: 1000,
              },
            },
          }
        });
      }
    }
  }, []);

  const updateChart = (labels: number[], liveData: (number | null)[]) => {
    if (!chartRef.current) return;
  
    chartRef.current.data.labels = labels;
    chartRef.current.data.datasets[0].data = liveData;
  
    // 🔍 각 ms 타임스탬프에 대해 10ms 단위 originalPitch 인덱스로 대응
    const originalData = labels.map((time) => {
      const index = Math.floor(time / 34);
      return originalNotes[index] ?? null;
    });
  
    chartRef.current.data.datasets[1].data = originalData;
  
    const nowMs = (audioRef.current?.currentTime ?? 0) * 1000;
  
    chartRef.current.update('none');
  };
  

  const handleRecord = async () => {
    if (isRecording) {
      // 녹음 종료
      setIsRecording(false);
      isRecordingRef.current = false;

      // MediaRecorder 중단
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current!.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const userUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrlAction(userUrl); // 🔊 유저 음성만 담긴 파일 저장
      };

      // 오디오 정지
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // 분석용 상태에 복사
      setPitchData([...pitchDataRef.current]);
      setTimeStamps([...timeStampsRef.current]);
      return;
    }
    
    // 초기화
    pitchDataRef.current = [];
    timeStampsRef.current = [];
    tickRef.current = 0;
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
    // ✅ MediaRecorder 초기화 추가
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    mediaRecorder.start();

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

  // console.log('PitchRecorder mounted with uuid:', uuid, 'audioUrl:', audioUrl);

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

  const fetchAudioNotes = async () => {
    const response = await fetch('/api/music_meta_note/' + uuid, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch audio notes');
    }
    const data = await response.json();
    return data;
  };

  useEffect(() => {
    if (uuid && audioUrl) {
      console.log('Fetching audio data for uuid:', uuid);
      fetchAudioData()
        .then((data) => {
          console.log('Audio data fetched');
          lyricsRef.current = JSON.parse(data.lyrics);
          setOriginalPitch(data.pitch_vector);
        })
        .catch((error) => {
          console.error('Error fetching audio data:', error);
        });
      fetchAudioNotes()
        .then((data) => {
          setOriginalNotes(data.notes)
        })
        .catch((error) => {
          console.error('Error fetching audio notes:', error);
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
      <h1 className='text-2xl font-bold mb-4'>실시간 피치 분석기</h1>
      <audio ref={audioRef} src={audioUrl ?? undefined} />

      <div className='w-[60%] mx-auto mb-4'>
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          style={{ marginTop: '20px', border: '1px solid #ccc' }}
        />
      </div>

      {currentLyric && (
        <div> 
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
      <Button
        type="primary"
        icon={isRecording ? <AudioFilled /> : <AudioOutlined />}
        size="large"
        onClick={handleRecord}
        style={{
          backgroundColor: '#6366F1', // indigo-400에 해당
          borderColor: '#6366F1',
          maxWidth: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className='ml-auto mr-2'
      >
        {isRecording ? '녹음 종료' : '실시간 피치 녹음'}
      </Button>

    </div>
  );
}
