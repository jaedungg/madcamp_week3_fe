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

function hzToMidi(hz: number | null): number | null {
  if (!hz || hz <= 0) return null;
  return Math.round(69 + 12 * Math.log2(hz / 440));
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
    if (user !== null) {
      total++;
      if (Math.abs(ref - user) <= 1) {
        correct++;
      }
    }
  }

  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export default function PitchRecorder({uuid, audioUrl, setUserAudioUrlAction} : PitchRecorderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const pitchDataRef = useRef<(number | null)[]>([]);
  const timeStampsRef = useRef<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(0);
  const [originalNotes, setOriginalNotes] = useState<(number | null)[]>([]);

  const [currentLyric, setCurrentLyric] = useState<string>('');
  const lyricsRef = useRef<{ start: number; duration: number; text: string }[]>([]);

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
                label: 'Live Pitch (Hz)',
                data: [],
                borderColor: 'blue',
                fill: false,
                pointRadius: 0,
              },
              {
                label: 'Original Note (MIDI)',
                data: [],
                borderColor: 'gray',
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
              },
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: {
                  display: false,
                  color: '#666',
                  font: { size: 10 },
                  callback: (value) => `${(Number(value)).toFixed(1)}s`,
                },
              },
              y: {
                grid: { display: false },

                min: 30,
                max: 100,
                ticks: {
                  callback: (val) => `MIDI ${val}`,
                  color: '#444',
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

    // 범위: 1초 전 ~ 4초 후
    const windowStart = now - 1000;
    const windowEnd = now + 4000;

    const filteredTime = timeStamps.filter((t) => t >= windowStart && t <= windowEnd);
    const filteredUserPitch = userPitch.slice(-filteredTime.length);

    const frameDuration = 256 / 22050 * 1000;
    const filteredOriginal = filteredTime.map((t) => {
      const index = Math.floor(t / frameDuration);
      return originalNotes[index] ?? null;
    });

    chartRef.current.data.labels = filteredTime;
    chartRef.current.data.datasets[0].data = filteredUserPitch;
    chartRef.current.data.datasets[1].data = filteredOriginal;

    chartRef.current.update('none');
  };

  const handleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      isRecordingRef.current = false;

      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current!.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const userUrl = URL.createObjectURL(audioBlob);
        setUserAudioUrlAction(userUrl);
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

      const currentScore = calculateAccuracyLive(pitchDataRef.current, originalNotes);
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
    return data;
  };

  // === fetch original notes ===
  useEffect(() => {
    if (!uuid || !audioUrl) return;

    // fetch('/api/music_meta_note/' + uuid)
    //   .then((res) => res.json())
    //   .then((data) => setOriginalNotes(data.notes))
    //   .catch(console.error);
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
        setOriginalNotes(data.notes)
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

  return (
    <div>
      <audio ref={audioRef} src={audioUrl ?? undefined} />

      <div className='w-[60%] mx-auto my-6 relative'>
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          style={{ marginTop: '20px', border: '1px solid #ccc' }}
        />
        <h1
          className="absolute right-4 top-3 inline-block text-4xl font-extrabold text-indigo-500 drop-shadow-sm drop-shadow-indigo-500"
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
      <div className='h-8'> 
        {currentLyric && (
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
        )}
      </div>
      <div className='flex flex-row justify-center mt-12 relative'>

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
