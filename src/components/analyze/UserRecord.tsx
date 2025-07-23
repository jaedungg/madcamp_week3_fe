'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Select, Button, Card, Typography } from 'antd';
import { SoundOutlined, PlayCircleOutlined, PauseCircleOutlined, RobotOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

interface UserRecordProps {
  uuid: string | null;
  audioUrl: string | null;
  userAudioUrl: string | null;
  setUserAudioUrl: Dispatch<SetStateAction<string | null>>;
}

export default function UserRecord({ uuid, audioUrl, userAudioUrl }: UserRecordProps) {
  // 오디오 refs
  const mrAudioRef = useRef<HTMLAudioElement | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);
  const echoedAudioRef = useRef<HTMLAudioElement | null>(null);
  const tunedAudioRef = useRef<HTMLAudioElement | null>(null);

  const [echoedAudioUrl, setEchoedAudioUrl] = useState<string | null>(null);
  const [tunedAudioUrl, setTunedAudioUrl] = useState<string | null>(null);

  const [selectedEffect, setSelectedEffect] = useState<'echo' | 'autotune' | null>(null);
  const [loadingEffect, setLoadingEffect] = useState(false);

  const [playing, setPlaying] = useState<'none' | 'user' | 'echo' | 'tune'>('none');

  // 리소스 정리
  useEffect(() => {
    return () => {
      [mrAudioRef, userAudioRef, echoedAudioRef, tunedAudioRef].forEach(ref => {
        const audio = ref.current;
        if (audio) {
          audio.pause();
          audio.src = '';
          ref.current = null;
        }
      });
    };
  }, []);

  // 재생 제어 함수
  const playDual = (mainUrl: string, vocalUrl: string, type: 'user' | 'echo' | 'tune') => {
    stopAll(); // 중복 방지

    const mrAudio = new Audio(mainUrl);
    const vocalAudio = new Audio(vocalUrl);

    mrAudio.volume = 0.6;
    vocalAudio.volume = 1.0;

    mrAudioRef.current = mrAudio;
    if (type === 'user') userAudioRef.current = vocalAudio;
    if (type === 'echo') echoedAudioRef.current = vocalAudio;
    if (type === 'tune') tunedAudioRef.current = vocalAudio;

    // 재생 상태 변경
    mrAudio.play();
    vocalAudio.play();
    setPlaying(type);

    const handleEnd = () => {
      stopAll();
    };

    mrAudio.onended = handleEnd;
    vocalAudio.onended = handleEnd;
  };

  const stopAll = () => {
    [mrAudioRef, userAudioRef, echoedAudioRef, tunedAudioRef].forEach(ref => {
      const audio = ref.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
        ref.current = null;
      }
    });
    setPlaying('none');
  };

  const handleAddEcho = async () => {
    if (!userAudioUrl) return;
    try {
      const res = await fetch(userAudioUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('delay', '250');
      formData.append('repeat', '3');
      formData.append('decay', '0.5');

      const echoRes = await fetch('http://172.20.12.58:80/add_echo', {
        method: 'POST',
        body: formData,
      });

      if (echoRes.ok) {
        const echoedBlob = await echoRes.blob();
        const url = URL.createObjectURL(echoedBlob);
        setEchoedAudioUrl(url);
      } else {
        alert('에코 추가 실패');
      }
    } catch (err) {
      console.error(err);
      alert('에코 처리 중 오류 발생');
    }
  };

  const handleAutoTune = async () => {
    if (!userAudioUrl || !uuid) return;
    try {
      const res = await fetch(userAudioUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('audio', blob, 'user_recording.webm');
      formData.append('musicid', uuid);

      const tuneRes = await fetch('http://172.20.12.58:80/autotune_vocal', {
        method: 'POST',
        body: formData,
      });

      if (tuneRes.ok) {
        const tunedBlob = await tuneRes.blob();
        const url = URL.createObjectURL(tunedBlob);
        setTunedAudioUrl(url);
      } else {
        alert('오토튠 실패');
      }
    } catch (err) {
      console.error(err);
      alert('오토튠 처리 중 오류 발생');
    }
  };

  return (
    <div>
      {userAudioUrl && (
        <div className="flex flex-col gap-2">
          <Card title="🎙 유저 녹음 확인">
            <Button
              type="default"
              size="large"
              icon={playing === 'user' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => {
                if (playing === 'user') stopAll();
                else if (audioUrl && userAudioUrl) playDual(audioUrl, userAudioUrl, 'user');
              }}
              style={{ width: 180 }}
            >
              {playing === 'user' ? '녹음 정지' : 'MR + 녹음 재생'}
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
                  if (value === 'echo') await handleAddEcho();
                  else await handleAutoTune();
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
                icon={playing === 'echo' ? <PauseCircleOutlined /> : <SoundOutlined />}
                onClick={() => {
                  if (playing === 'echo') stopAll();
                  else if (audioUrl && echoedAudioUrl) playDual(audioUrl, echoedAudioUrl, 'echo');
                }}
              >
                {playing === 'echo' ? '정지' : '재생'}
              </Button>
            )}

            {selectedEffect === 'autotune' && tunedAudioUrl && (
              <Button
                type="default"
                size="large"
                icon={playing === 'tune' ? <PauseCircleOutlined /> : <RobotOutlined />}
                onClick={() => {
                  if (playing === 'tune') stopAll();
                  else if (audioUrl && tunedAudioUrl) playDual(audioUrl, tunedAudioUrl, 'tune');
                }}
              >
                {playing === 'tune' ? '정지' : '재생'}
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
