'use client';

import { Dispatch, SetStateAction, use, useEffect, useRef, useState } from 'react';
import { detectPitch } from '@/lib/util/pitchUtils'; // 오토코릴레이션 pitch detection 함수
import { Button, Card, Collapse, Progress, Typography } from 'antd';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const { Text } = Typography;

interface UserRecordProps {
  uuid: string | null;
  audioUrl: string | null;
  userAudioUrl: string | null;
  setUserAudioUrl: Dispatch<SetStateAction<string | null>>;
}

export default function UserRecord({uuid, audioUrl, userAudioUrl} : UserRecordProps) {
  // 오디오 재생
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 가사 표시
  const [currentLyric, setCurrentLyric] = useState<string>('');
  const lyricsRef = useRef<{ start: number; duration: number; text: string }[]>([]);
  // 유저 노래 녹음
  const recordedChunksRef = useRef<Blob[]>([]);
  const [echoedAudioUrl, setEchoedAudioUrl] = useState<string | null>(null);  

  const [userRecordPlaying, setUserRecordPlaying] = useState(false);
  const [echoedRecordPlaying, setEchoedRecordPlaying] = useState(false);

  const mrAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const echoedAudioRef = useRef<HTMLAudioElement | null>(null);

  const playMergedAudio = () => {
    if (!audioUrl || !userAudioUrl) return;

    if (mrAudioRef.current && userAudioRef.current) {
      // 정지
      setUserRecordPlaying(false);
      mrAudioRef.current.pause();
      mrAudioRef.current.currentTime = 0;
      userAudioRef.current.pause();
      userAudioRef.current.currentTime = 0;
      mrAudioRef.current = null;
      userAudioRef.current = null;
      return;
    }
  
    // 재생
    setUserRecordPlaying(true);
    const mrAudio = new Audio(audioUrl);
    const userAudio = new Audio(userAudioUrl);
    mrAudio.volume = 0.6;
    userAudio.volume = 1.0;
  
    mrAudio.play();
    userAudio.play();
  
    mrAudioRef.current = mrAudio;
    userAudioRef.current = userAudio;
  };

  const handleAddEcho = async () => {
    if (!userAudioUrl) return;
  
    try {
      // fetch를 통해 Blob 생성
      const audioResponse = await fetch(userAudioUrl);
      const audioBlob = await audioResponse.blob();
  
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('delay', '250'); // ms
      formData.append('repeat', '3');
      formData.append('decay', '0.5');
  
      const res = await fetch('http://172.20.12.58:80/add_echo', {
        method: 'POST',
        body: formData,
      });

      console.log("res status", res.status);
      console.log("res", res);
  
      if (res.ok) {
        const echoedBlob = await res.blob();
        const url = URL.createObjectURL(echoedBlob);
        setEchoedAudioUrl(url);
      } else {
        alert('에코 추가 실패');
      }
    } catch (err) {
      console.error('에코 추가 중 오류 발생:', err);
      alert('에코 추가 중 오류가 발생했습니다.');
    }
  };
  

  const playMergedEchoed = () => {
    if (!audioUrl || !echoedAudioUrl) return;

    if (mrAudioRef.current && echoedAudioRef.current) {
      // 정지
      setEchoedRecordPlaying(false);
      mrAudioRef.current.pause();
      mrAudioRef.current.currentTime = 0;
      echoedAudioRef.current.pause();
      echoedAudioRef.current.currentTime = 0;
      mrAudioRef.current = null;
      echoedAudioRef.current = null;
      return;
    }
  
    setEchoedRecordPlaying(true);
    const mrAudio = new Audio(audioUrl);
    const echoAudio = new Audio(echoedAudioUrl);
    mrAudio.volume = 0.6;
    echoAudio.volume = 1.0;
  
    mrAudio.play();
    echoAudio.play();
  
    mrAudioRef.current = mrAudio;
    echoedAudioRef.current = echoAudio;
  };

  // const analyzePitch = () => {
  //   const cleaned = pitchDataRef.current.filter(
  //     (p) => p !== null && p > 50 && p < 800
  //   ) as number[];
  //   const average =
  //   cleaned.reduce((a, b) => a + b, 0) / cleaned.length || 0;
  //   const variance =
  //   cleaned.reduce((acc, p) => acc + Math.pow(p - average, 2), 0) /
  //   cleaned.length || 0;
    
  //   const result: string[] = [];
  //   if (average > 500)
  //     result.push('⚠️ 전반적으로 고음 위주입니다. 안정적인 발성이 필요해요.');
  //   if (variance > 2000)
  //     result.push('🎯 음정 흔들림이 큽니다. 발성의 일관성을 연습해보세요.');
  //   if (average < 200)
  //     result.push('📉 음정이 낮은 편입니다. 더 정확한 음정을 겨냥해보세요.');
    
  //   setFeedback(result);
  //   setAnalyzed(true);
  // };

  console.log('UserRecord mounted with uuid:', uuid, 'audioUrl:', audioUrl);

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
      <h1 className='text-xl font-bold mb-4'>🎼 유저 녹음 확인</h1>
      {userAudioUrl && (
        <div className="mt-4 flex gap-4">
          <button onClick={playMergedAudio} className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
            {userRecordPlaying? '⏹ 재생 정지' : '▶️ MR + 녹음 재생'}
          </button>
          <button onClick={handleAddEcho} className="bg-indigo-500 text-white px-4 py-2 rounded cursor-pointer">
            ✨ 에코 추가
          </button>
        </div>
      )}

      {echoedAudioUrl && (
        <button onClick={playMergedEchoed} className="mt-2 bg-purple-600 text-white px-4 py-2 rounded">
          {echoedRecordPlaying ? '⏹ 정지' : '🎧 에코 음성 + MR 재생'}
        </button>
      )}
    </div>
  );
}
