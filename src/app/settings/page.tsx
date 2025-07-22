'use client';
import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { userid } = useUser();
  const [nickname, setNickname] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState(`http://172.20.12.58:80/profile/${userid}`);
  const [file, setFile] = useState<File | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
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
      console.log("user profile", data);

      setNickname(data.nickname);
      setThumbnailUrl(data.profile_url);
    };
    fetchProfile();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleNicknameChange = async () => {
    console.log("handleNicknameChange called", userid)
    const res = await fetch(`/api/user/${userid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname }),
    });

    if (!res.ok) alert('닉네임 변경 실패');
    else alert('닉네임 변경 완료');
  };

  const handleImageUpload = async () => {
    if (!file) return alert('파일을 선택해주세요');
    try {
      // Step 1: 이미지 업로드 (Flask로 직접 전송)
      const formData = new FormData();
      
      formData.append('file', file);
      formData.append('userid', userid);
  
      const uploadRes = await fetch('http://172.20.12.58:80/upload', {
        method: 'POST',
        body: formData,
      });
  
      const text = await uploadRes.text();
      console.log('upload response text:', text);
      const uploadData = JSON.parse(text);
      
      const profile_url = uploadData.profile_url;
      console.log('변경할 프로필 URL:', profile_url);

      const res = await fetch(`/api/user/${userid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: profile_url }),
      });
  
      const result = await res.json();
      if (!res.ok) {
        alert('프로필 사진 변경 실패: ' + (result?.error || '서버 오류'));
      } else {
        alert('프로필 사진 변경 성공!');
        setThumbnailUrl(profile_url)
      }
    } catch (error) {
      console.error('에러 발생:', error);
      alert('프로필 변경 중 문제가 발생했습니다.');
    }
  };

  const toggleDarkMode = (enabled: boolean) => {
    setIsDark(enabled);
    localStorage.setItem('theme', enabled ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', enabled);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-10 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">🛠️ 설정</h1>

      {/* 프로필 섹션 */}
      <div className="flex items-center gap-6">
        <img
          src={thumbnailUrl || '/images/profile.jpg'}
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
          <button
            onClick={handleImageUpload}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          >
            프로필 사진 변경
          </button>
        </div>
      </div>

      {/* 닉네임 섹션 */}
      <div className="flex items-center gap-4">
        <input
          className="flex-1 border border-gray-300 px-3 py-2 rounded text-black dark:text-white dark:bg-gray-800"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임 입력"
        />
        <button
          onClick={handleNicknameChange}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          닉네임 변경
        </button>
      </div>

      {/* 다크모드 토글 */}
      <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded">
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
    </div>
  );
}
