'use client';

import { LoadingOutlined } from '@ant-design/icons';
import { Dispatch, useEffect } from 'react';
import { SetStateAction, useState } from 'react';

interface MRLoaderProps {
  setShowRecorderAction: (value: boolean) => void;
  uuid: string | null;
  audioUrl: string | null;
  setUuidAction: Dispatch<SetStateAction<string | null>>;
  setAudioUrlAction: Dispatch<SetStateAction<string | null>>;
}

export default function MRLoader( {setShowRecorderAction, uuid, audioUrl, setUuidAction, setAudioUrlAction} : MRLoaderProps ) {
  const [method, setMethod] = useState<'youtube' | 'file' | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSeparating, setIsSeparating] = useState(false);

  const handleSeparation = async () => {
    console.log('handleSeparation called');
    setIsSeparating(true);
    setUuidAction(null);
    setAudioUrlAction(null);

    if (file) {
      const formData = new FormData();
      formData.append('audio', file);

      const res = await fetch('http://172.20.12.58:80/accompaniment', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      console.log('Response data:', data);
      console.log('Response uuid:', data.uuid);

      setUuidAction(data.uuid);
      setIsSeparating(false);
    } else if (youtubeUrl) {

      const res = await fetch('/api/separate', {
        method: 'POST',
        body: youtubeUrl,
      });

      const data = await res.json();
      console.log('Response data:', data);
      console.log('Response uuid:', data.uuid);

      setUuidAction(data.uuid);
      setIsSeparating(false);
    } else {
      alert('YouTube URL을 입력하거나 파일을 업로드해주세요.');
    }
  };

  const handleDownload = async () => {
    if (!uuid) return;
    
    const res = await fetch(`/api/accompaniment?uuid=${uuid}`);
    const data = await res.json();

    console.log('Download response data:', data);
    if (data.path) setAudioUrlAction(data.path);
  };
  
  useEffect (() => {
    if (uuid) {
      handleDownload();
    }
  }, [uuid]);

  return (
    <div className="max-w-4xl mx-auto my-auto space-y-10">

      {/* 방법 선택 */}
      <h1 className='text-xl font-bold mb-4'>
        YouTube 링크를 입력하거나 .mp3 파일을 업로드하세요.
      </h1>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setMethod('youtube')}
          className={`flex flex-1 items-center justify-center p-3 rounded-lg text-lg transition cursor-pointer ${
            method === 'youtube'
              ? "text-black bg-indigo-200"
              : "bg-gray-100 text-black hover:bg-gray-200"
          }`}
        >
          📺  YouTube 링크
        </button>
        <button
          onClick={() => setMethod('file')}
          className={`flex flex-1 items-center justify-center p-3 rounded-lg text-lg transition cursor-pointer ${
            method === 'file'
              ? "text-black bg-indigo-200"
              : "bg-gray-100 text-black hover:bg-gray-200"
          }`}
        >
          🎵파일 업로드
        </button>
      </div>

      {/* 입력창 */}
      {method === 'youtube' && (
        <input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/..."
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '16px',
            borderRadius: '6px',
            border: '1px solid #ccc',
          }}
        />
      )}
      {method === 'file' && (
        <input
          type="file"
          accept=".mp3"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '16px' }}
        />
      )}

      <button
        onClick={handleSeparation}
        className={`flex w-full items-center justify-center p-3 rounded-lg text-lg bg-indigo-300 transition hover:bg-indigo-400 cursor-pointer`}
      >
        {isSeparating ? <span className='gap-2'><LoadingOutlined /> 분리 중</span> : '🔊 MR 분리하기'}

      </button>
      
      {audioUrl && (
        <div className="mt-4 space-y-2 text-lg">
          <p className="font-semibold text-xl">✅ MR 분리 완료</p>
          {audioUrl && (
            <div className='my-4 space-y-2 text-xl font-semibold'>
              <audio controls src={audioUrl} style={{ width: '100%' }} />
            </div>
          )}

          {/* <button
            onClick={handleDownload}
            className="w-full p-3 rounded-lg text-lg bg-indigo-300 transition hover:bg-indigo-400"
          >
            🎧 MR 다운로드
          </button> */}

          <button
            onClick={() => setShowRecorderAction(true)}
            className="w-full p-3 rounded-lg text-lg bg-indigo-500 text-white transition hover:bg-indigo-600"
          >
            🎤 이 노래 부르기
          </button>
        </div>
      )}
    </div>
  );
}
