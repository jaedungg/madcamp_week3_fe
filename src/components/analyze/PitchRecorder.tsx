'use client';

import { Dispatch, SetStateAction, use, useEffect, useRef, useState } from 'react';
import { detectPitch } from '@/lib/util/pitchUtils'; // 오토코릴레이션 pitch detection 함수
import { Button, Card, Collapse, Progress, Typography, Alert, Flex, Spin } from 'antd';
import { AudioOutlined, AudioFilled, StopOutlined } from '@ant-design/icons';
import { Chart, registerables } from 'chart.js';
import { useSession } from 'next-auth/react';

Chart.register(...registerables);

interface PitchRecorderProps {
  uuid: string | null;
  audioUrl: string | null;
  setUserAudioUrlAction: Dispatch<SetStateAction<string | null>>;
  setAudioUrlAction: Dispatch<SetStateAction<string | null>>;
}

function hzToMidi(hz: number | null): number | null {
  if (!hz || hz <= 0) return null;
  return Math.round(69 + 12 * Math.log2(hz / 440));
}

function midiToNoteName(midi: number): string {
  const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const note = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function calculateAccuracyLive(
  userPitchHz: (number | null)[],
  originalNotes: (number | null)[]
): number {
  const userMidi = userPitchHz.map(hzToMidi);
  const minLength = Math.min(userMidi.length, originalNotes.length);

  let correct = 0;
  let total = 0;

  for (let i = 0; i < minLength; i++) {
    const ref = originalNotes[i];
    const user = userMidi[i];
    if (ref === null) continue; // 기준이 없으면 비교 안 함
    if (true) {
      total++;
      if (user != null && Math.abs(ref - user) <= 5) {
        correct++;
      }
    }
  }

  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export default function PitchRecorder({uuid, audioUrl, setUserAudioUrlAction, setAudioUrlAction} : PitchRecorderProps) {
  const { data: session } = useSession();
  const userid = session?.user?.userid || '';
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const pitchDataRef = useRef<(number | null)[]>([]);
  const timeStampsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);
  const lastValidPitchRef = useRef<number | null>(null); // 마지막 유효한 피치 저장

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [originalNotes, setOriginalNotes] = useState<(number | null)[]>([]);

  const [currentLyric, setCurrentLyric] = useState<string>('');
  const lyricsRef = useRef<{ start: number; duration: number; text: string }[]>([]);

  const [isNoteFetched, setIsNoteFetched] = useState(false);

  // === 상수 정의 ===
  const SAMPLE_RATE = 22050;
  const HOP_LENGTH = 256;
  const FRAME_DURATION_MS = (HOP_LENGTH / SAMPLE_RATE) * 1000; // ~11.6ms per frame

  const handleDownload = async () => {
    if (!uuid) return;

    const res = await fetch(`/api/accompaniment?uuid=${uuid}`);
    const data = await res.json();

    console.log('Response data (audioUrl):', data);
    if (data.path) setAudioUrlAction(data.path);
  };

  useEffect(() => {
    if (uuid) {
      handleDownload();
    }
  }, [uuid]);

  // === Chart 초기화 ===
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
                label: 'User Pitch (MIDI)',
                data: [],
                borderColor: 'rgb(6, 182, 212)', // cyan-300
                fill: false,
                pointRadius: 0,
                tension: 0.1,
                borderWidth: 3,
              },
              {
                label: 'Original Note (MIDI)',
                data: [],
                borderColor: 'gray',
                fill: false,
                pointRadius: 0,
                borderDash: [8, 4],
                borderWidth: 3, // 더 두꺼운 선
                tension: 0.1, // 부드러운 곡선
              },
              {
                label: 'Current Point',
                data: [],
                borderColor: 'rgb(6, 182, 212)', // cyan-300
                backgroundColor: 'rgb(6, 182, 212)', // cyan-300
                pointRadius: 6,
                pointBorderWidth: 2,
                pointBorderColor: 'white',
                showLine: false,
                pointHoverRadius: 8,
              },
              {
                label: 'Current Time Line',
                data: [],
                borderColor: 'rgb(199, 210, 254)', // red-500
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: false,
                pointRadius: 0,
                borderWidth: 2,
                showLine: true,
              }
            ],
          },
          options: {
            animation: false,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                grid: { 
                  display: false,
                  color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                  display: true,
                  color: '#666',
                  font: { size: 11 },
                  // callback: (value) => {
                  //   const seconds = (Number(value) / 1000).toFixed(1);
                  //   return `${seconds}s`;
                  // },
                  callback: (value, index, ticks) => {
                    // 마지막 tick만 표시
                    if (index === ticks.length - 1) {
                      const seconds = (Number(value) / 1000).toFixed(1);
                      return `${seconds}s`;
                    }
                    return '';
                  },
                },
              },
              y: {
                grid: { 
                  display: false,
                  color: 'rgba(0, 0, 0, 0.1)',
                },
                min: 30,
                max: 100,
                ticks: {
                  callback: (val) => {
                    if (typeof val === 'number') return midiToNoteName(val);
                    return '';
                  },
                  color: '#444',
                  font: { size: 11 }
                },
              },
            },
          },
        });
      }
    }
  }, []);

  const updateChart = () => {
    if (!chartRef.current) return;

    const timeStamps = timeStampsRef.current;
    const userPitch = pitchDataRef.current.map(hzToMidi);

    // 현재 시간(ms)
    const now = timeStamps.at(-1) ?? 0;

    // 그래프 윈도우: 현재 기준 -1초 ~ +4초 (총 5초 윈도우)
    const windowStart = now - 1000; // -1초
    const windowEnd = now + 4000;   // +4초

    // 시간 범위에 맞는 데이터 필터링 (사용자 피치용)
    const filteredIndices: number[] = [];
    const filteredTime: number[] = [];
    const filteredUserPitch: (number | null)[] = [];

    timeStamps.forEach((timestamp, index) => {
      if (timestamp >= windowStart && timestamp <= windowEnd) {
        filteredIndices.push(index);
        filteredTime.push(timestamp);
        filteredUserPitch.push(userPitch[index]);
      }
    });

    // 원곡 피치 데이터 생성 - 전체 윈도우에 대해 미리 생성 (미래 피치 포함)
    const originalPitchData: ({ x: number; y: number } | null)[] = [];

    for (let timestamp = windowStart; timestamp <= windowEnd; timestamp += 10) {
      const frameIndex = Math.floor(timestamp / FRAME_DURATION_MS);
      const originalPitch = originalNotes[frameIndex];
    
      if (originalPitch !== null && originalPitch !== undefined) {
        originalPitchData.push({
          x: timestamp,
          y: originalPitch,
        });
      } else {
        originalPitchData.push(null); // 선을 끊는 지점
      }
    }

    // 차트 데이터 업데이트
    chartRef.current.data.labels = Array.from(
      {length: Math.floor((windowEnd - windowStart) / 10)}, 
      (_, i) => windowStart + i * 10
    );
    
    chartRef.current.data.datasets[0].data = filteredUserPitch.map((pitch, i) => 
      pitch !== null ? { x: filteredTime[i], y: pitch } : null
    ).filter(Boolean);
    
    // 원곡 피치는 미래까지 표시 (오른쪽에서 왼쪽으로 다가오는 효과)
    chartRef.current.data.datasets[1].data = originalPitchData;

    // 현재 포인트 표시 (파란 점) - 직전 유효한 피치 값 유지
    const currentPitch = userPitch.at(-1);
    if (currentPitch !== null && currentPitch !== undefined) {
      lastValidPitchRef.current = currentPitch; // 유효한 피치가 있으면 업데이트
    }
    
    // 현재 포인트는 항상 표시 (유효한 피치가 있었던 경우)
    const displayPitch = lastValidPitchRef.current;
    chartRef.current.data.datasets[2].data = (displayPitch !== null && now) 
      ? [{ x: now, y: displayPitch }] 
      : [];

    // 현재 시점 세로선 추가
    chartRef.current.data.datasets[3].data = now 
      ? [
          { x: now, y: 30 },  // Y축 최소값
          { x: now, y: 100 }  // Y축 최대값
        ]
      : [];

    // X축 범위 설정 (고정된 윈도우)
    chartRef.current.options.scales!.x!.min = windowStart;
    chartRef.current.options.scales!.x!.max = windowEnd;

    chartRef.current.update('none');
  };

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      isRecordingRef.current = false;

      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current!.onstop = async () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const userUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrlAction(userUrl);
      
        // 서버에 업로드 (FormData 사용)
        const formData = new FormData();
        formData.append('audio', audioBlob, `${uuid}.webm`);
        formData.append('userid', userid); 
        formData.append('musicid', uuid ?? '');
        formData.append('score', String(score));

        console.log("upload data: ", userid, uuid, String(score))
      
        try {
          const res = await fetch('http://172.20.12.58:80/user_record', {
            method: 'POST',
            body: formData,
          });
      
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || '업로드 실패');
          console.log('🎉 녹음 업로드 성공:', result);
        } catch (err) {
          console.error('🎤 녹음 업로드 에러:', err);
          alert('녹음 업로드 중 오류가 발생했습니다.');
        }
      };      

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      return;
    }

    // 초기화
    pitchDataRef.current = [];
    timeStampsRef.current = [];
    startTimeRef.current = performance.now();
    lastValidPitchRef.current = null; // 마지막 유효 피치도 초기화
    setIsRecording(true);
    isRecordingRef.current = true;

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    recordedChunksRef.current = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
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
      const elapsed = performance.now() - startTimeRef.current;

      pitchDataRef.current.push(pitch ?? null);
      timeStampsRef.current.push(elapsed);
      updateChart();

      // 정확도 계산 - 현재까지의 프레임 수에 맞춰서 계산
      const currentFrameIndex = Math.floor(elapsed / FRAME_DURATION_MS);
      const relevantOriginalNotes = originalNotes.slice(0, currentFrameIndex + 1);
      const currentScore = calculateAccuracyLive(pitchDataRef.current, relevantOriginalNotes);
      setScore(currentScore);

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
    setIsNoteFetched(true);
    return data;
  };

  // === fetch original notes ===
  useEffect(() => {
    if (!uuid || !audioUrl) return;

    console.log('Fetching audio data for uuid:', uuid);
    fetchAudioData()
      .then((data) => {
        console.log('Audio data fetched');
        lyricsRef.current = JSON.parse(data.lyrics);
      })
      .catch((error) => {
        console.error('Error fetching audio data:', error);
      });
    fetchAudioNotes()
      .then((data) => {
        setOriginalNotes(data.notes);
        console.log(`Original notes loaded: ${data.notes.length} frames, frame duration: ${FRAME_DURATION_MS.toFixed(2)}ms`);
      })
      .catch((error) => {
        console.error('Error fetching audio notes:', error);
      });
  }, [uuid, audioUrl]);

  // 가사 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRecordingRef.current || !startTimeRef.current || !lyricsRef.current) return;

      const elapsedSec = (performance.now() - startTimeRef.current) / 1000;

      const current = lyricsRef.current.find(
        (line) =>
          elapsedSec >= line.start &&
          elapsedSec <= line.start + line.duration
      );

      setCurrentLyric(current?.text ?? '');
    }, 100); // 100ms 주기로 검사

    return () => clearInterval(interval);
  }, []);

  const contentStyle: React.CSSProperties = {
    padding: 80,
    borderRadius: 12,
  };

  const content = <div style={contentStyle} />;

  return (
    <div className='relative h-full w-full'>
      {(!isNoteFetched || !audioUrl) && (
        <div className='absolute inset-0 flex items-center justify-center z-50 bg-white' style={{ minHeight: '100%' }}>
          <Spin tip="Loading..." size="large">{content}</Spin>
        </div>
      )}
      <audio ref={audioRef} src={audioUrl ?? undefined} />

      <div className='w-[70%] mx-auto my-6 relative'>
        <div style={{ height: '300px', position: 'relative' }}>
          <canvas
            ref={canvasRef}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
        </div>
        <h1
          className="absolute right-4 top-3 inline-block text-4xl font-extrabold text-cyan-500 drop-shadow-sm drop-shadow-cyan-500"
          style={{
            textShadow: `-1px -1px 0 #FFFFFF,
                         1px -1px 0 #FFFFFF,
                        -1px  1px 0 #FFFFFF,
                         1px  1px 0 #FFFFFF`
          }}
        >
          {score} 점 
        </h1>
      </div>
        {isRecording && (
          <h1
            className="h-8 text-center my-2 text-2xl font-bold text-white drop-shadow-sm drop-shadow-cyan-500"
            style={{
              textShadow: `-1px -1px 0 #4f46e5,
                           1px -1px 0 #4f46e5,
                          -1px  1px 0 #4f46e5,
                           1px  1px 0 #4f46e5`
            }}
          >
            {currentLyric}
          </h1>
        )}
      <div className='flex flex-row justify-center mt-8 relative'>

        <Button
          type="primary"
          icon={isRecording ? <AudioFilled /> : <AudioOutlined />}
          size="large"
          style={{padding: "24px", fontSize: "20px", fontWeight: "700"}}
          onClick={handleRecord}
        >
          {isRecording ? '녹음 종료' : '녹음 시작'}
        </Button>
      </div>

    </div>
  );
}