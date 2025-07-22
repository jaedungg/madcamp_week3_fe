'use client';

import { CheckCircleOutlined, CheckCircleTwoTone, LoadingOutlined, UploadOutlined } from '@ant-design/icons';
import { Dispatch, useEffect } from 'react';
import { SetStateAction, useState } from 'react';
import { Input, Form, Select, Upload } from 'antd';

interface MRLoaderProps {
  setShowRecorderAction: (value: boolean) => void;
  uuid: string | null;
  audioUrl: string | null;
  setUuidAction: Dispatch<SetStateAction<string | null>>;
  setAudioUrlAction: Dispatch<SetStateAction<string | null>>;
}

export default function MRLoader({
  setShowRecorderAction,
  uuid,
  audioUrl,
  setUuidAction,
  setAudioUrlAction,
}: MRLoaderProps) {
  const [method, setMethod] = useState<'youtube' | 'file' | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSeparating, setIsSeparating] = useState(false);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');

  const handleSeparation = async () => {
    console.log('handleSeparation called');
    console.log('song info: ', title, artist, genre);
    setUuidAction(null);
    setAudioUrlAction(null);

    if (!file && !youtubeUrl) {
      alert('YouTube URL을 입력하거나 파일을 업로드해주세요.');
      return;
    }

    setIsSeparating(true);

    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append('audio', file);

        response = await fetch('http://172.20.12.58:80/accompaniment', {
          method: 'POST',
          body: formData,
        });
      } else if (youtubeUrl) {
        response = await fetch('/api/separate', {
          method: 'POST',
          body: youtubeUrl,
        });
      }

      const data = await response?.json();
      console.log('Response data:', data);
      setUuidAction(data.uuid);
      await handleEditMusic(data.uuid); 
    } catch (error) {
      alert('MR 분리 중 오류가 발생했습니다.');
    } finally {
      // ✅ 입력값 초기화
      setIsSeparating(false);
      setMethod(null);
      setYoutubeUrl('');
      setFile(null);
      setTitle('');
      setArtist('');
      setGenre('');
      form.resetFields(); // Form 내부 값도 초기화
    }
  };

  const handleEditMusic = async (musicid: string) => {
    if (!musicid || !title || !artist || !genre) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('http://172.20.12.58:80/edit-music', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'untitled',
          artist: artist || 'unknown',
          genre: genre || 'unknown',
          musicid: musicid,
        }),
      });
  
      if (!res.ok) throw new Error('Failed to update music');
  
      const result = await res.json();
      console.log('음악 정보 수정 완료:', result);
    } catch (err) {
      console.error('음악 정보 수정 실패:', err);
      alert('음악 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDownload = async () => {
    if (!uuid) return;

    const res = await fetch(`/api/accompaniment?uuid=${uuid}`);
    const data = await res.json();

    console.log('Response data (audioUrl):', data);
    if (data.path) setAudioUrlAction(data.path);
  };

  useEffect(() => {
    if (uuid) {
      handleDownload();
    }
  }, [uuid]);

  const handleFileUpload = (e: any) => {
    const file = e?.fileList?.[0]?.originFileObj;
    if (file) setFile(file);
    return e?.fileList || [];
  };

  const { Option } = Select;

  const layout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 20 },
  };
  const [form] = Form.useForm();


  return (
    <div className="max-w-4xl mx-auto my-auto space-y-10 text-sm">
      <div>
        
        {/* 방법 선택 */}
        <h1 className='text-lg font-bold mb-4 px-8'>
          YouTube 링크를 입력하거나 .mp3 파일을 업로드하세요.
        </h1>

        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setMethod('youtube')}
            className={`flex flex-1 items-center justify-center p-3 rounded-lg transition cursor-pointer ${
              method === 'youtube'
                ? "text-black bg-indigo-300"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            📺  YouTube 링크
          </button>
          <button
            onClick={() => setMethod('file')}
            className={`flex flex-1 items-center justify-center p-3 rounded-lg transition cursor-pointer ${
              method === 'file'
                ? "text-black bg-indigo-300"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            🎵파일 업로드
          </button>
        </div>

        {/* 입력창 */}
        {(method != null)  && (
        <div className='pt-2'>
          <Form
            {...layout}
            form={form}
            name="control-hooks"
          >
            {method === 'youtube' && (
              <Form.Item name="유튜브 링크" label="유튜브 링크" rules={[{ required: true, message: "유튜브 링크를 입력해주세요." }]}>
                <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/..."/>
              </Form.Item>
            )}
            {method === 'file' && (
              <Form.Item
                label="음악 파일"
                name="mp3"
                valuePropName="fileList"
                getValueFromEvent={handleFileUpload}
                rules={[{ required: true, message: 'MP3 파일을 업로드해주세요.' }]}
              >
                <Upload
                  accept="audio/*"
                  beforeUpload={() => false} // 업로드는 직접 처리
                  maxCount={1}
                  listType="text"
                >
                  <button
                    type="button"
                    style={{ color: 'inherit', cursor: 'pointer', border: 0, background: 'none' }}
                  >
                    <UploadOutlined /> MP3 파일 선택
                  </button>
                </Upload>
              </Form.Item>
            )}
            <Form.Item name="노래 제목" label="노래 제목" rules={[{ required: true, message: "노래 제목을 입력해주세요." }]}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)}/>
            </Form.Item>
            <Form.Item name="가수 이름" label="가수 이름" rules={[{ required: true, message: "가수 이름을 입력해주세요." }]}>
              <Input value={artist} onChange={(e) => setArtist(e.target.value)}/>
            </Form.Item>
            <Form.Item name="장르" label="장르" rules={[{ required: true }]}>
              <Select
                placeholder="곡의 장르를 선택해주세요."
                value={genre}
                onChange={(value) => setGenre(value)}
              >
                <Option value="발라드">발라드</Option>
                <Option value="댄스">댄스</Option>
                <Option value="힙합">힙합</Option>
                <Option value="락">락</Option>
                <Option value="밴드">밴드</Option>
                <Option value="팝">팝</Option>
                <Option value="R&B">R&B</Option>
                <Option value="인디">인디</Option>
                <Option value="트로트">트로트</Option>
                <Option value="기타">기타</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
        )}

        <button
          onClick={handleSeparation}
          className={`flex w-full items-center justify-center p-3 rounded-lg ${isSeparating ? "bg-indigo-400" : "bg-indigo-300"} transition hover:bg-indigo-400 cursor-pointer`}
        >
          {isSeparating ? <p className='flex gap-3 items-center'><LoadingOutlined /> 분리 중</p> : '🔊 MR 분리하기'}

        </button>
      </div>

      
      {audioUrl && (
        <div className="mt-10">
          <p className="flex flex-row font-semibold text-lg items-center gap-1.5 justify-center"><CheckCircleTwoTone twoToneColor="#eb2f96"/> MR 분리 완료</p>
          {audioUrl && (
            <div className='my-4 space-y-2 text-lg font-semibold'>
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
            className="w-full p-3 rounded-lg bg-indigo-500 text-white transition hover:bg-indigo-600"
          >
            🎤 이 노래 부르기
          </button>
        </div>
      )}
    </div>
  );
}
