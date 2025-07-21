'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@/context/UserContext';

export default function SettingsPage() {
  const { setUserid: setGlobalUserid } = useUser();
  const [userid, setUserid] = useState('');
  const [passwd, setPasswd] = useState('');
  const [nickname, setNickname] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);


  const handleGetUser = async () => {
    const response = await fetch('/api/user/' + userid, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await response.json();
    console.log("signindata", data);

    setGlobalUserid(userid);
    console.log("userid:", userid);
  
    setNickname('');
    setUserid('');
    setPasswd('');
    setPreviewUrl(null);
    setIsDark(false);
  };  

  return (
    <div className="max-w-xl mx-auto p-6 space-y-10 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">! 로그인 !</h1>

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
        <button
          onClick={handleGetUser}
          className="bg-indigo-500 w-full text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          로그인
        </button>
      </div>
    </div>
  );
}
