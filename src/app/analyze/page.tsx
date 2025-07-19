'use client';

import dynamic from 'next/dynamic';

const PitchRecorder = dynamic(() => import('@/components/analyze/PitchRecorder'), { ssr: false });

export default function PitchAnalyzerPage() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>🎼 실시간 피치 분석기</h1>
      <PitchRecorder />
      {/* <SimpleChart /> */}
    </main>
  );
}


// 'use client';

// import PitchAnalyzer from "@/components/analyze/PitchAnalyzer";
// import { AudioOutlined, UploadOutlined } from "@ant-design/icons";
// import { Button, Card, message, Progress, Upload } from "antd";
// import { useState } from "react";

// export default function AnalyzePage() {
//   const [file, setFile] = useState(null);
//   const [analysisStarted, setAnalysisStarted] = useState(false);
//   const [pitchScore, setPitchScore] = useState(0);
//   const [rhythmScore, setRhythmScore] = useState(0);
//   const [showReport, setShowReport] = useState(true);

//   const handleUpload = (info: { file: { status: string; name: any; originFileObj: React.SetStateAction<null>; }; }) => {
//     if (info.file.status === 'done') {
//       message.success(`${info.file.name} 업로드 완료`);
//       setFile(info.file.originFileObj);
//     }
//   };

//   const handleAnalyze = () => {
//     if (!file) {
//       message.warning('분석할 음원을 먼저 업로드해주세요.');
//       return;
//     }
//     setAnalysisStarted(true);

//     // 예시 분석 결과 시뮬레이션
//     setTimeout(() => {
//       setPitchScore(82);
//       setRhythmScore(91);
//       setShowReport(true);
//     }, 2000);
//   };
  
//   return (
//     <div className="font-sans flex flex-col h-full w-full space-y-12">
//       <PitchAnalyzer />
//       <h2>🎤 노래 분석하기</h2>

//       <Upload
//         name="audio"
//         showUploadList={false}
//         beforeUpload={() => false}
//         onChange={() => handleUpload}
//       >
//         <Button icon={<UploadOutlined />}>노래 파일 업로드</Button>
//       </Upload>

//       <Button
//         type="primary"
//         icon={<AudioOutlined />}
//         style={{ marginTop: '16px' }}
//         onClick={handleAnalyze}
//       >
//         분석 시작
//       </Button>

//       {analysisStarted && (
//         <div style={{ marginTop: '32px' }}>
//           <Card title="분석 결과" bordered>
//             <p>음정 정확도</p>
//             <Progress percent={pitchScore} status="active" />
//             <p>박자 일치도</p>
//             <Progress percent={rhythmScore} status="active" />
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// }
