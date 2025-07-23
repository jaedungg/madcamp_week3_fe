'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [userid, setUserid] = useState('');
  const [passwd, setPasswd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function handleLogin() {
    setErrorMsg('');
    const result = await signIn('credentials', {
      redirect: false, // false면 결과만 받음
      userid,
      passwd,
    });

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      alert('로그인 성공!');
      // 로그인 성공 후 메인 페이지 등으로 이동 가능
      router.push('/');
    }
  }

  function handleGoSignup() {
    router.push('/signup');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8 space-y-6">
        <div className="text-center">
          <img
            className="h-60 mx-auto mb-4"
            src="/images/logo.png"
            alt="로고"
          />
          <h1 className="text-2xl font-bold text-gray-800">로그인</h1>
          <p className="text-sm text-gray-500">아이디와 비밀번호를 입력해주세요</p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            placeholder="아이디"
          />
          <input
            className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
            type="password"
            value={passwd}
            onChange={(e) => setPasswd(e.target.value)}
            placeholder="비밀번호"
          />

          {errorMsg && (
            <p className="text-red-500 text-sm text-center">{errorMsg}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-cyan-600 text-white py-2 rounded hover:bg-cyan-700 transition"
          >
            로그인
          </button>

          <button
            onClick={handleGoSignup}
            className="w-full bg-gray-100 text-gray-800 py-2 rounded hover:bg-gray-200 transition"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}
