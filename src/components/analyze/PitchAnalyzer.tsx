'use client';

import { useEffect, useRef, useState } from 'react';

interface PitchPoint {
  time: number; // seconds
  pitch: number; // Hz
}

const mockOriginal: PitchPoint[] = [
  { time: 0, pitch: 220 },
  { time: 1, pitch: 260 },
  { time: 2, pitch: 300 },
  { time: 3, pitch: 280 },
  { time: 4, pitch: 330 },
  { time: 5, pitch: 290 },
];

const mockUser: PitchPoint[] = [
  { time: 0, pitch: 210 },
  { time: 1, pitch: 255 },
  { time: 2, pitch: 310 },
  { time: 3, pitch: 270 },
  { time: 4, pitch: 320 },
  { time: 5, pitch: 295 },
];

const MAX_TIME = 5; // seconds
const WIDTH = 600;
const HEIGHT = 300;

function mapTimeToX(time: number) {
  return (time / MAX_TIME) * WIDTH;
}

function mapPitchToY(pitch: number) {
  const minPitch = 200;
  const maxPitch = 350;
  return HEIGHT - ((pitch - minPitch) / (maxPitch - minPitch)) * HEIGHT;
}

export default function PitchAnalyzer() {
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrentTime((prev) => (prev < MAX_TIME ? prev + 0.1 : prev));
    }, 100);

    return () => clearInterval(intervalRef.current);
  }, []);

  const originalPoints = mockOriginal.map(
    (p) => `${mapTimeToX(p.time)},${mapPitchToY(p.pitch)}`
  ).join(' ');

  const userPoints = mockUser.map(
    (p) => `${mapTimeToX(p.time)},${mapPitchToY(p.pitch)}`
  ).join(' ');

  const currentX = mapTimeToX(currentTime);

  return (
    <div className="bg-black text-white p-4 rounded-md w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🎵 실시간 피치 분석</h2>
      <svg width={WIDTH} height={HEIGHT} className="bg-gray-800 rounded-md">
        {/* 원곡 피치 (파랑) */}
        <polyline points={originalPoints} stroke="#3b82f6" strokeWidth="2" fill="none" />

        {/* 유저 피치 (노랑) */}
        <polyline points={userPoints} stroke="#facc15" strokeWidth="2" fill="none" />

        {/* 현재 위치 타임라인 */}
        <line x1={currentX} y1={0} x2={currentX} y2={HEIGHT} stroke="#fff" strokeDasharray="4" />
      </svg>

      <div className="mt-4 flex justify-between items-center text-sm">
        <div>Time: {currentTime.toFixed(1)}s</div>
        <div>
          Score:{' '}
          <span className="font-bold text-green-400">
            {calculateScore(currentTime).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

// 점수 계산 (원곡 피치와 유저 피치 차이 기반)
function calculateScore(time: number): number {
  const user = mockUser.find((p) => Math.round(p.time) === Math.round(time));
  const original = mockOriginal.find((p) => Math.round(p.time) === Math.round(time));

  if (!user || !original) return 0;

  const diff = Math.abs(user.pitch - original.pitch);
  const percent = Math.max(0, 100 - diff); // 단순화된 계산
  return percent;
}
