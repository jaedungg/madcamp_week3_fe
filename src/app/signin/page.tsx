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
    <div className="max-w-xl mx-auto p-6 space-y-10 text-gray-900 dark:text-white">
      <h1 className="text-2xl font-bold">! 로그인 !</h1>

      <div className="flex flex-col w-full gap-4">
        <input
          className="border border-gray-300 px-3 py-2 rounded"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
          placeholder="아이디 입력"
        />
        <input
          className="border border-gray-300 px-3 py-2 rounded"
          type="password"
          value={passwd}
          onChange={(e) => setPasswd(e.target.value)}
          placeholder="비밀번호 입력"
        />
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        <button
          onClick={handleLogin}
          className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
        >
          로그인
        </button>

        {/* 회원가입 버튼 추가 */}
        <button
          onClick={handleGoSignup}
          className="mt-2 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
          type="button"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
