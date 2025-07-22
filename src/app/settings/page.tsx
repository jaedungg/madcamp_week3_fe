'use client';

import { useSession } from 'next-auth/react';
import { useProfileImage } from '@/context/ProfileImageContext';
import { useNickname } from '@/context/NicknameContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const { profileImageKey, refreshProfileImage } = useProfileImage();
  const { nickname, setNickname } = useNickname();
  const router = useRouter();

  const userid = session?.user?.userid || '';
  const [nicknameLocal, setNicknameLocal] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  const imgUpdateTsRef = useRef(Date.now());

  async function fetchProfileInfo() {
    if (!userid) return;
    try {
      const res = await fetch(`/api/user/${userid}`);
      if (!res.ok) throw new Error('프로필 정보를 불러오는데 실패했습니다.');
      const data = await res.json();

      setNicknameLocal(data.nickname || nickname || '');
      setThumbnailUrl(`http://172.20.12.58:80/profile/${userid}`);

      imgUpdateTsRef.current = Date.now();
      // 세션과 Context 닉네임 동기화가 잘 안될 수 있으니 안전하게 setNickname도 호출
      if (data.nickname && data.nickname !== nickname) {
        setNickname(data.nickname);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    if (!userid) {
      setLoading(false);
      return;
    }
    setLoading(true);

    fetchProfileInfo().finally(() => setLoading(false));

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, [userid]);

  const handleNicknameChange = async () => {
    if (!userid) return alert('로그인이 필요합니다.');

    try {
      const res = await fetch(`/api/user/${userid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nicknameLocal }),
      });
      if (!res.ok) throw new Error('닉네임 변경에 실패했습니다.');

      alert('닉네임 변경 완료');

      // NextAuth 세션도 업데이트 (네임만 바꿔도 세션에 반영)
      if (update) await update({ name: nicknameLocal });

      // Context 및 로컬 상태 동기화
      setNickname(nicknameLocal);

      // 서버에서 최신 프로필 다시 fetch
      await fetchProfileInfo();

      // 페이지 전체 새로고침으로 데이터 싱크 보장
      router.refresh();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '닉네임 변경 중 오류가 발생했습니다.'
      );
    }
  };

  const handleImageUpload = async () => {
    if (!file || !userid) return alert('파일과 로그인 상태를 확인해주세요.');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userid', userid);

      const uploadRes = await fetch('http://172.20.12.58:80/upload', {
        method: 'POST',
        body: formData,
      });
      const text = await uploadRes.text();
      const uploadData = JSON.parse(text);

      const res = await fetch(`/api/user/${userid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: uploadData.profile_url }),
      });

      if (!res.ok) {
        const result = await res.json();
        alert('프로필 사진 변경 실패: ' + (result.error ?? '서버 오류'));
        return;
      }

      alert('프로필 사진이 변경되었습니다.');

      refreshProfileImage();

      imgUpdateTsRef.current = Date.now();

      await fetchProfileInfo();

      router.refresh();
    } catch (error) {
      console.error('프로필 사진 변경 중 에러:', error);
      alert('프로필 사진 변경 중 문제가 발생했습니다.');
    }
  };

  const toggleDarkMode = (on: boolean) => {
    setIsDark(on);
    localStorage.setItem('theme', on ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', on);
  };

  if (loading) return <div>로딩 중...</div>;
  if (status === 'unauthenticated') return <div>로그인이 필요합니다.</div>;

  return (
    <div className="max-w-xl mx-auto p-6 space-y-10 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">프로필 설정</h1>

      {/* 프로필 섹션 */}
      <div className="flex items-center gap-6">
        <img
          src={
            thumbnailUrl
              ? `${thumbnailUrl}?t=${imgUpdateTsRef.current}`
              : '/images/profile.jpg'
          }
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
          value={nicknameLocal}
          onChange={(e) => setNicknameLocal(e.target.value)}
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
