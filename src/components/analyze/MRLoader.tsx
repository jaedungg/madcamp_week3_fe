// 'use client';

// import { useState } from 'react';
// import { detectPitch } from '@/lib/util/pitchUtils'; // 오토코릴레이션 pitch detection 함수
// import { Button, Card, Collapse, Progress, Typography } from 'antd';
// import { Chart, registerables } from 'chart.js';

// export default function MRLoader() {
//   const [youtubeUrl, setYoutubeUrl] = useState<string>('');
//   const [file, setFile] = useState<File | null>(null);
//   const [uuid, setUuid] = useState<string | null>(null);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // const handleSeparation = async () => {
  //   console.log('handleSeparation called');
  //   setUuid(null);
  //   setAudioUrl(null);

  //   if (file) {
  //     const formData = new FormData();
  //     formData.append('audio', file);

  //     const res = await fetch('http://172.20.12.58:80/accompaniment', {
  //       method: 'POST',
  //       body: formData,
  //       mode: 'no-cors',
  //     });

  //     const data = await res.json();
  //     setUuid(data.uuid);
  //   } else if (youtubeUrl) {
  //     const res = await fetch('/api/separate', {
  //       method: 'POST',
  //       body: youtubeUrl,
  //     });

  //     console.log('Response:', res);
  //     console.log('Response status:', res.status);

  //     const data = await res.json();
  //     setUuid(data.uuid);
  //   } else {
  //     alert('YouTube URL을 입력하거나 파일을 업로드해주세요.');
  //   }
  // };

//   const handleDownload = async () => {
//     if (!uuid) return;

//     const res = await fetch(`/api/accompaniment?uuid=${uuid}`);
//     const data = await res.json();

//     if (data.path) {
//       setAudioUrl(data.path);
//     }
//   };

//   return (
//     <div >
//       <h2>🎙 음원 분리 테스트</h2>

//       <div>
//         <label>🎥 YouTube URL 입력:</label><br />
//         <input
//           type="text"
//           value={youtubeUrl}
//           onChange={(e) => setYoutubeUrl(e.target.value)}
//           placeholder="https://www.youtube.com/..."
//           style={{ width: '100%', padding: '8px', marginBottom: '12px' }}
//         />
//       </div>

//       <div>
//         <label>🎵 또는 MP3 파일 업로드:</label><br />
//         <input
//           type="file"
//           accept=".mp3"
//           onChange={(e) => setFile(e.target.files?.[0] || null)}
//           style={{ marginBottom: '16px' }}
//         />
//       </div>

//       <button onClick={handleSeparation}>🚀 분리 시작</button>

//       {uuid && (
//         <div style={{ marginTop: '16px' }}>
//           <p>✅ 분리된 UUID: {uuid}</p>
//           <button onClick={handleDownload}>🎧 MR 다운로드</button>
//         </div>
//       )}

//       {audioUrl && (
//         <div style={{ marginTop: '20px' }}>
//           <p>🔊 오디오 미리듣기:</p>
//           <audio controls src={audioUrl}>
//             브라우저가 오디오를 지원하지 않습니다.
//           </audio>
//         </div>
//       )}
//     </div>
//   );
// }


'use client';

import { useState } from 'react';

export default function MRLoader() {
  const [method, setMethod] = useState<'youtube' | 'file' | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uuid, setUuid] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleSeparation = async () => {
    console.log('handleSeparation called');
    setUuid(null);
    setAudioUrl(null);

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
      setUuid(data.uuid);
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
    if (data.path) setAudioUrl(data.path);
  };

  return (
    <div className="max-w-4xl mx-auto my-auto space-y-10">

      {/* 방법 선택 */}
      <h1 className='text-2xl font-bold mb-4'>
        YouTube 링크를 입력하거나 .mp3 파일을 업로드하세요:
      </h1>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setMethod('youtube')}
          className={`flex flex-1 items-center justify-center p-3 rounded-lg text-lg transition cursor-pointer ${
            method === 'youtube'
              ? "bg-indigo-100 text-black "
              : "bg-gray-100 text-black"
          }`}
        >
          📺 YouTube 링크
        </button>
        <button
          onClick={() => setMethod('file')}
          className={`flex flex-1 items-center justify-center p-3 rounded-lg text-lg transition cursor-pointer ${
            method === 'file'
              ? "bg-indigo-100 text-black "
              : "bg-gray-100 text-black"
          }`}
        >
          🎵 파일 업로드
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
        className={`flex w-full items-center justify-center p-3 rounded-lg text-lg bg-indigo-300 transition cursor-pointer`}
      >
        🚀 분리 시작
      </button>

      {uuid && (
        <div style={{ marginTop: '20px' }}>
          <p>✅ MR 분리 완료 {uuid}</p>
          <button onClick={handleDownload}>🎧 MR 다운로드</button>
        </div>
      )}

      {audioUrl && (
        <div style={{ marginTop: '20px' }}>
          <p>🔊 오디오 미리듣기:</p>
          <audio controls src={audioUrl} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
