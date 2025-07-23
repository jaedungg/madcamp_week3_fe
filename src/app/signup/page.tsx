'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SettingsPage() {
  const [userid, setUserid] = useState('');
  const [passwd, setPasswd] = useState('');
  const [nickname, setNickname] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // cleanup: 메모리 누수 방지
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const enabled = theme === 'dark';
    setIsDark(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  }, []);

  const toggleDarkMode = (enabled: boolean) => {
    setIsDark(enabled);
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', enabled);
  };

  const handleAddUser = async () => {
    if (!file) {
      alert("프로필 이미지를 선택해주세요.");
      return;
    }
    console.log('file:', file);
    console.log('file.name:', file?.name);
  
    try {
      // ✅ Step 1: 이미지 업로드 (Flask로 직접 전송)
      const formData = new FormData();
      
      formData.append('file', file);
      formData.append('userid', userid);
  
      const uploadRes = await fetch('http://172.20.12.58:80/upload', {
        method: 'POST',
        body: formData,
        // mode: 'no-cors'
      });
  
      const text = await uploadRes.text();
      console.log('upload response text:', text);
      const uploadData = JSON.parse(text);
      
      const profile_url = uploadData.profile_url;
      console.log('✅ 프로필 URL:', profile_url);
  
      // ✅ Step 2: 유저 정보 등록 (Next.js 서버 경유)
      const userData = {
        userid,
        passwd,
        nickname,
        profile_url,
      };
  
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
  
      const result = await res.json();
      if (!res.ok) {
        alert('회원가입 실패: ' + (result?.error || '서버 오류'));
      } else {
        alert('회원가입 성공!');
      }
    } catch (error) {
      console.error('에러 발생:', error);
      alert('회원가입 중 문제가 발생했습니다.');
    }
    setNickname('');
    setUserid('');
    setPasswd('');
    setFile(null);
    setPreviewUrl(null);
    setIsDark(false);
  };  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 space-y-6">
        <div className="text-center">
          <img
            className="h-44 mx-auto mb-4"
            src="/images/logo.png"
            alt="로고"
          />
          <h1 className="text-2xl font-bold text-gray-800">회원가입</h1>
          <p className="text-sm text-gray-500">계정을 생성하고 시작해보세요</p>
        </div>
  
        {/* 프로필 섹션 */}
        <div className="flex flex-row pl-3 items-center gap-4">
          <img
            src={previewUrl || '/images/profile.jpg'}
            alt="프로필 사진"
            className="w-20 h-20 rounded-full object-cover border"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file:bg-cyan-500 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3"
          />
        </div>
  
        <div className="space-y-4">
          <input
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-black"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            placeholder="아이디 입력"
          />
          <input
            type="password"
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-black"
            value={passwd}
            onChange={(e) => setPasswd(e.target.value)}
            placeholder="비밀번호 입력"
          />
          <input
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500 text-black"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 입력"
          />
  
          {/* 다크모드 토글 */}
          {/* <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded">
            <span className="font-medium text-gray-700">다크모드</span>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isDark}
                onChange={(e) => toggleDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-cyan-500 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div> */}
  
          <button
            onClick={handleAddUser}
            className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700 transition"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
  
}
