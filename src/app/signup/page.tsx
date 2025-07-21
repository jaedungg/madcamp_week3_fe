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
    <div className="max-w-xl mx-auto p-6 space-y-10 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">! 회원가입 !</h1>

      {/* 프로필 섹션 */}
      <div className="flex items-center gap-6">
        <img
          src={previewUrl || '/images/profile.jpg'}
          alt="프로필 사진"
          className="w-24 h-24 rounded-full object-cover border"
        />
        <div className="flex flex-col gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file:bg-indigo-500 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-2"
          />
        </div>
      </div>

      <div className="flex flex-col items-start w-full gap-4">
        {/* 아이디 섹션 */}
        <input
          className="flex-1 w-full border border-gray-300 px-3 py-2 rounded text-black dark:text-white dark:bg-gray-800"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
          placeholder="아이디 입력"
        />
        {/* 비밀번호 섹션 */}
        <input
          className="flex-1 w-full border border-gray-300 px-3 py-2 rounded text-black dark:text-white dark:bg-gray-800"
          value={passwd}
          onChange={(e) => setPasswd(e.target.value)}
          placeholder="비밀번호 입력"
        />
        {/* 닉네임 섹션 */}
        <input
          className="flex-1 w-full border border-gray-300 px-3 py-2 rounded text-black dark:text-white dark:bg-gray-800"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 입력"
        />
        {/* 다크모드 토글 */}
        <div className="flex items-center w-full justify-between bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded">
          <span className="font-medium">다크모드</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isDark}
              onChange={(e) => toggleDarkMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all relative peer-checked:bg-indigo-500"></div>
          </label>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-indigo-500 w-full text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
