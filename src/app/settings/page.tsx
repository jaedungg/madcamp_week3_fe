'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [nickname, setNickname] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch('/api/profile/me');
      const data = await res.json();
      setNickname(data.nickname);
      setThumbnailUrl(data.thumbnailUrl);
    };
    fetchProfile();

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleNicknameChange = async () => {
    const res = await fetch('/api/profile/me/nickname', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changedName: nickname }),
    });

    if (!res.ok) alert('닉네임 변경 실패');
    else alert('닉네임 변경 완료');
  };

  const handleImageUpload = async () => {
    if (!file) return alert('파일을 선택해주세요');
    const formData = new FormData();
    formData.append('thumbnail', file);

    const res = await fetch('/api/profile/me/thumbnail', {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) alert('프로필 사진 변경 실패');
    else {
      const data = await res.json();
      setThumbnailUrl(data.newUrl);
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
