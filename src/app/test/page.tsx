'use client';

import { useState } from 'react';

export default function TestClient() {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleSeparation = async () => {
    setUuid(null);
    setAudioUrl(null);

    if (file) {
      // const formData = new FormData();
      // formData.append('audio', file);

      // const res = await fetch('http://172.20.12.58:80/accompaniment', {
      //   method: 'POST',
      //   body: formData,
      // });

      // const data = await res.json();
      // setUuid(data.uuid);
    } else if (youtubeUrl) {
      const res = await fetch('/api/separate', {
        method: 'POST',
        body: youtubeUrl,
      });

      console.log('Response:', res);
      console.log('Response status:', res.status);

      const data = await res.json();
      setUuid(data.uuid);
    } else {
      alert('YouTube URL을 입력하거나 파일을 업로드해주세요.');
    }
  };

  const handleDownload = async () => {
    if (!uuid) return;

    const res = await fetch(`/api/accompaniment?uuid=${uuid}`);
    const data = await res.json();

    if (data.path) {
      setAudioUrl(data.path);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🎙 음원 분리 테스트</h2>

      <div>
        <label>🎥 YouTube URL 입력:</label><br />
        <input
          type="text"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/..."
          style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
        />
      </div>

      <div>
        <label>🎵 또는 MP3 파일 업로드:</label><br />
        <input
          type="file"
          accept=".mp3"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: '16px' }}
        />
      </div>

      <button onClick={handleSeparation}>🚀 분리 시작</button>

      {uuid && (
        <div style={{ marginTop: '16px' }}>
          <p>✅ 분리된 UUID: {uuid}</p>
          <button onClick={handleDownload}>🎧 MR 다운로드</button>
        </div>
      )}

      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>🔊 오디오 미리듣기:</p>
          <audio controls src={audioUrl}>
            브라우저가 오디오를 지원하지 않습니다.
          </audio>
        </div>
      )}
    </div>
  );
}
