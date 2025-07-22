'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Button, Card, List, Tag, Typography, Space } from 'antd';
import { YoutubeOutlined, RocketOutlined } from '@ant-design/icons';
import TrainingContents from '@/constants/TrainingContents';
import Link from 'next/link';

const { Paragraph } = Typography;

// 게임 화면 크기 고정, 전체 글씨·카드 높이 축소
function HoverJumpGame({ onClose }: { onClose: () => void }) {
  const [started, setStarted] = useState(false);
  const [dispY, setDispY] = useState(0);
  const [volume, setVolume] = useState(0);
  const [obstacles, setObstacles] = useState<
    { x: number; w: number; h: number }[]
  >([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const y = useRef(0);
  const raf = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const arrRef = useRef<Uint8Array | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const obstaclesRef = useRef(obstacles);
  const gameOverRef = useRef(gameOver);

  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  // 게임판 고정 크기 (SCALE = 1.6)
  const SCALE = 1.6;
  const GRAVITY = -1.9 * SCALE;
  const GROUND = 0;
  const CEILING = 140 * SCALE;
  const JUMP_THRESHOLD = 0.1;
  const HOVER_FORCE = 2.7 * SCALE;
  const BALL_RADIUS = 12 * SCALE;
  const CANVAS_W = 335 * SCALE;
  const CANVAS_H = 199 * SCALE;
  const OBSTACLE_W = 18 * SCALE;
  const OBSTACLE_GAP = 160 * SCALE;
  const OBSTACLE_MIN = 18 * SCALE,
    OBSTACLE_MAX = 60 * SCALE;

  const start = async () => {
    if (raf.current) cancelAnimationFrame(raf.current);

    setStarted(true);
    setGameOver(false);
    gameOverRef.current = false;
    setScore(0);
    y.current = GROUND;
    setDispY(GROUND);
    setVolume(0);

    const firstObstacle = {
      x: CANVAS_W,
      w: OBSTACLE_W,
      h: Math.random() * (OBSTACLE_MAX - OBSTACLE_MIN) + OBSTACLE_MIN,
    };
    setObstacles([firstObstacle]);
    obstaclesRef.current = [firstObstacle];

    if (ctxRef.current) {
      try {
        await ctxRef.current.close();
      } catch {}
      ctxRef.current = null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new window.AudioContext();
      await ctx.resume();
      const analyser = ctx.createAnalyser();
      const mic = ctx.createMediaStreamSource(stream);
      mic.connect(analyser);
      analyser.fftSize = 256;
      const arr = new Uint8Array(analyser.frequencyBinCount);

      analyserRef.current = analyser;
      arrRef.current = arr;
      ctxRef.current = ctx;

      let vel = 0;
      function loop() {
        if (gameOverRef.current) return;

        let vol = 0;
        if (analyserRef.current && arrRef.current) {
          analyserRef.current.getByteTimeDomainData(arrRef.current);
          let sum = 0;
          for (let i = 0; i < arrRef.current.length; i++) {
            const v = (arrRef.current[i] - 128) / 128;
            sum += v * v;
          }
          vol = Math.sqrt(sum / arrRef.current.length);
          setVolume(vol);
        }
        if (vol > JUMP_THRESHOLD) {
          vel = HOVER_FORCE * Math.min(vol * 9, 2.8);
        } else {
          vel += GRAVITY;
        }

        y.current += vel;
        if (y.current > CEILING) {
          y.current = CEILING;
          vel = 0;
        }
        if (y.current < GROUND) {
          y.current = GROUND;
          vel = 0;
        }
        setDispY(y.current);

        setObstacles((prev) => {
          const newObs = prev
            .map((obs) => ({ ...obs, x: obs.x - 3 * SCALE }))
            .filter((obs) => obs.x + OBSTACLE_W > 0);
          if (
            newObs.length === 0 ||
            newObs[newObs.length - 1].x < CANVAS_W - OBSTACLE_GAP
          ) {
            newObs.push({
              x: CANVAS_W,
              w: OBSTACLE_W,
              h: Math.random() * (OBSTACLE_MAX - OBSTACLE_MIN) + OBSTACLE_MIN,
            });
          }
          obstaclesRef.current = newObs;
          return newObs;
        });

        setScore((s) => s + 1);

        for (const obs of obstaclesRef.current) {
          const bx = 50 * SCALE,
            br = BALL_RADIUS;
          const by = y.current + BALL_RADIUS;
          if (
            obs.x < bx + br &&
            obs.x + obs.w > bx - br &&
            by > 0 &&
            by - br < obs.h
          ) {
            setGameOver(true);
            gameOverRef.current = true;
            setStarted(false);
            if (raf.current) cancelAnimationFrame(raf.current);
            return;
          }
        }
        if (!gameOverRef.current) raf.current = requestAnimationFrame(loop);
      }
      raf.current = requestAnimationFrame(loop);
    } catch (error) {
      setGameOver(false);
      setStarted(false);
      alert('마이크 접근 권한이 필요합니다.');
    }
  };

  useEffect(() => {
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      ctxRef.current?.close();
    };
  }, []);

  if (!started || gameOver)
    return (
      <div style={{ padding: 36, textAlign: 'center', fontSize: 17 }}>
        {!gameOver ? (
          <div className='flex flex-col items-center'>
            <div style={{ marginBottom: 18, color: '#555', fontSize: 16 }}>
              목청으로 공을 띄우세요 <br /> 장애물에 닿으면 GAME OVER!
            </div>
            <Button
              type="primary"
              size="large"
              onClick={start}
            >
              게임 시작 (마이크 필요)
            </Button>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-6'>
            <div
              style={{
                color: '#da143b',
                fontWeight: 800,
                fontSize: 22,
              }}
            >
              GAME OVER
            </div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>
              점수: {score}
            </div>
            <div className='flex flex-row gap-2'>
              <Button
                type="primary"
                size="large"
                onClick={start}
              >
                다시하기
              </Button>
              <Button
                size="large"
                onClick={onClose}
              >
                닫기
              </Button>
            </div>
          </div>
        )}
        {!gameOver && (
          <Button
            style={{ marginTop: 13, fontSize: 15 }}
            onClick={onClose}
            ghost
          >
            닫기
          </Button>
        )}
      </div>
    );

  return (
    <div
      style={{
        width: CANVAS_W,
        height: CANVAS_H,
        background: '#e9effd',
        border: '2.5px solid #aaa',
        borderRadius: 13,
        margin: '0 auto',
        marginBottom: 15,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 13 * SCALE,
          background: '#8aa9e6',
          borderRadius: 9,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 50 * SCALE - BALL_RADIUS,
          bottom: dispY,
          width: BALL_RADIUS * 2,
          height: BALL_RADIUS * 2,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 60% 40%, #fcebeb 66%, #e15d2a 100%)',
          border: '2.5px solid #d22',
          boxShadow: volume > JUMP_THRESHOLD ? '0 0 18px #fa0' : '',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 10,
            top: 9,
            width: 8,
            height: 8,
            background: '#fff5e6',
            borderRadius: '50%',
            opacity: 0.36,
          }}
        />
      </div>
      {obstacles.map((obs, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: obs.x,
            bottom: 0,
            width: obs.w,
            height: obs.h,
            background: 'linear-gradient(180deg, #6a86ce 80%, #346ab6 100%)',
            border: '2px solid #475f96',
            borderRadius: 5,
            boxShadow: '2px 5px 20px #2236bb14',
          }}
        />
      ))}
      {/* 점수/볼륨 표시 */}
      <div
        style={{
          position: 'absolute',
          left: 15,
          top: 14,
          fontWeight: 700,
          fontSize: 19,
          color: '#233c65',
          textShadow: '0 2px 2px #fff, 0 1px 7px #8aa',
        }}
      >
        점수: {score}{' '}
        <span
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: '#38b',
            marginLeft: 10,
          }}
        >
          볼륨: {volume.toFixed(3)}
        </span>
      </div>
      <Button
        style={{ position: 'absolute', top: 13, right: 18, fontSize: 13 }}
        size="small"
        ghost
        onClick={onClose}
      >
        닫기
      </Button>
    </div>
  );
}

const SongAnalysisPage = () => {
  const [showGame, setShowGame] = useState(false);

  return (
    <div
      className="w-full space-y-5 text-gray-900 dark:text-white"
      style={{ fontSize: 15 }}
    >
      <Card
        title={
          <span className="text-lg font-bold">🔍 맞춤형 추천 루틴</span>
        }
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" size={12}>
          <Paragraph style={{ fontSize: 16, margin: 0 }}>
            🎯 체계적인 발성 및 음정 연습 → <Tag color="blue">추천 유튜브 콘텐츠</Tag>
          </Paragraph>
          <Paragraph style={{ fontSize: 16, margin: 0 }}>
            🎯 박자 및 성량 훈련 → <Tag color="purple">리듬 목청 점프 게임</Tag>
          </Paragraph>
        </Space>
      </Card>

      <Card
        title={
          <p>
            <YoutubeOutlined style={{ color: 'red' }} />
            <span className="text-lg font-bold ml-1"> 추천 유튜브 콘텐츠</span>
          </p>
        }
        style={{ marginBottom: 16 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={TrainingContents}
          renderItem={(item) => (
            <List.Item>
              <Link
                href={item.url}
                target="_blank"
                className="text-base hover:underline"
              >
                {item.title}
              </Link>
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={<span className="text-lg font-bold">🎮 리듬 목청 점프 게임</span>}
      >
        <Paragraph style={{ fontSize: 16, marginBottom: 8 }}>
          <b>소리를 내면 공이 위에 부양</b>하며 장애물을 피해보세요! <br />
          <span>장애물에 닿으면 GAME OVER.</span>
          <Tag color="magenta" style={{ marginLeft: 7 }}>
            마이크 필요
          </Tag>
        </Paragraph>

        {!showGame && (
          <Button
            icon={<RocketOutlined />}
            type="primary"
            size="large"
            onClick={() => setShowGame(true)}
          >
            게임 시작
          </Button>
        )}
        {showGame && <HoverJumpGame onClose={() => setShowGame(false)} />}
      </Card>
    </div>
  );
};

export default SongAnalysisPage;
