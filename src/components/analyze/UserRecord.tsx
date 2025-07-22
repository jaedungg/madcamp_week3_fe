'use client';

import { Dispatch, SetStateAction, use, useEffect, useRef, useState } from 'react';
import { detectPitch } from '@/lib/util/pitchUtils'; // 오토코릴레이션 pitch detection 함수
import { Select, Button, Card, Collapse, Progress, Typography } from 'antd';
import { Chart, registerables } from 'chart.js';
import { SoundOutlined, PlayCircleOutlined, PauseCircleOutlined, RobotOutlined } from '@ant-design/icons';

Chart.register(...registerables);

const { Text } = Typography;

interface UserRecordProps {
  uuid: string | null;
  audioUrl: string | null;
  userAudioUrl: string | null;
  setUserAudioUrl: Dispatch<SetStateAction<string | null>>;
}

export default function UserRecord({uuid, audioUrl, userAudioUrl} : UserRecordProps) {
  const { Option } = Select;
  const { Title } = Typography;
  
  // 오디오 재생
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 가사 표시
  const [currentLyric, setCurrentLyric] = useState<string>('');
  const lyricsRef = useRef<{ start: number; duration: number; text: string }[]>([]);
  // 유저 노래 녹음
  const recordedChunksRef = useRef<Blob[]>([]);
  const [echoedAudioUrl, setEchoedAudioUrl] = useState<string | null>(null);  
  const [tunedAudioUrl, setTunedAudioUrl] = useState<string | null>(null);  
  const [selectedEffect, setSelectedEffect] = useState<'echo' | 'autotune' | null>(null);
  const [loadingEffect, setLoadingEffect] = useState(false);

  const [userRecordPlaying, setUserRecordPlaying] = useState(false);
  const [echoedRecordPlaying, setEchoedRecordPlaying] = useState(false);
  const [tunedRecordPlaying, setTunedRecordPlaying] = useState(false);

  const mrAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const echoedAudioRef = useRef<HTMLAudioElement | null>(null);
  const tunedAudioRef = useRef<HTMLAudioElement | null>(null);

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

  const handleAutoTune = async () => {
    if (!userAudioUrl || !uuid) {
      alert('녹음된 파일 또는 musicid가 없습니다.');
      return;
    }
  
    try {
      // fetch를 통해 Blob 생성
      const audioResponse = await fetch(userAudioUrl);
      const audioBlob = await audioResponse.blob();
  
      const formData = new FormData();
      formData.append('audio', audioBlob, 'user_recording.webm');
      formData.append('musicid', uuid);
  
      const res = await fetch('http://172.20.12.58:80/autotune_vocal', {
        method: 'POST',
        body: formData,
      });

      console.log("res", res);
  
      if (res.ok) {
        const tunedBlob = await res.blob();
        const tunedUrl = URL.createObjectURL(tunedBlob);
        setTunedAudioUrl(tunedUrl);
      } else {
        alert('오토튠 처리 실패');
      }
    } catch (err) {
      console.error('에코 추가 중 오류 발생:', err);
      alert('에코 추가 중 오류가 발생했습니다.');
    }
  };

  const playMergedTuned = () => {
    if (!audioUrl || !tunedAudioUrl) return;

    if (mrAudioRef.current && tunedAudioRef.current) {
      // 정지
      setTunedRecordPlaying(false);
      mrAudioRef.current.pause();
      mrAudioRef.current.currentTime = 0;
      mrAudioRef.current = null;
      tunedAudioRef.current.pause();
      tunedAudioRef.current.currentTime = 0;
      tunedAudioRef.current = null;
      return;
    }
  
    setTunedRecordPlaying(true);
    const mrAudio = new Audio(audioUrl);
    const tunedAudio = new Audio(tunedAudioUrl);
    mrAudio.volume = 0.6;
    tunedAudio.volume = 1.0;
    mrAudio.play();
    tunedAudio.play();
  
    mrAudioRef.current = mrAudio;
    tunedAudioRef.current = tunedAudio;
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

  // console.log('UserRecord mounted with uuid:', uuid, 'audioUrl:', audioUrl);

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
    {userAudioUrl && (
      <div className="flex flex-col gap-2">
        <Card title="🎙 유저 녹음 확인">
          <Button
            type="default"
            size="large"
            style={{ width: 180}}
            icon={userRecordPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={playMergedAudio}
          >
            {userRecordPlaying ? '녹음 정지' : 'MR + 녹음 재생'}
          </Button>
        </Card>

        <Card title="🎛️ 후처리 효과 선택">
          <Select
            value={selectedEffect}
            placeholder="적용할 효과를 선택하세요"
            style={{ width: 180, marginRight: "8px" }}
            size="large"
            loading={loadingEffect}
            onChange={async (value: 'echo' | 'autotune') => {
              setSelectedEffect(value);
              setLoadingEffect(true);
              try {
                if (value === 'echo') {
                  await handleAddEcho();
                } else {
                  await handleAutoTune();
                }
              } catch (err) {
                console.error(err);
              } finally {
                setLoadingEffect(false);
              }
            }}
          >
            <Option value="echo">✨ 에코 추가</Option>
            <Option value="autotune">🤖 오토튠</Option>
          </Select>
          {selectedEffect === 'echo' && echoedAudioUrl && (
            <Button
              type="default"
              size="large"
              icon={echoedRecordPlaying ? <PauseCircleOutlined /> : <SoundOutlined />}
              onClick={playMergedEchoed}
            >
              {echoedRecordPlaying ? '정지' : '재생'}
            </Button>
          )}
          {selectedEffect === 'autotune' && tunedAudioUrl && (
            <Button
              type="default"
              size="large"
              icon={tunedRecordPlaying ? <PauseCircleOutlined /> : <RobotOutlined />}
              onClick={playMergedTuned}
            >
              {tunedRecordPlaying ? '정지' : '재생'}
            </Button>
          )}
        </Card>
      </div>
    )}
  </div>
  );
}
