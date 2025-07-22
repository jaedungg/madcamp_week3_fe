'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SettingsPage() {
  const [userid, setUserid] = useState('');
  const [passwd, setPasswd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleLogin() {
    setErrorMsg('');
    const result = await signIn('credentials', {
      redirect: false, // false면 팝업이나 별도 리다이렉션 없이 결과만 받음
      userid,
      passwd,
    });

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      // 로그인 성공 시 원하는 페이지로 강제 이동 가능
      // 예: router.push('/') 또는 reload 등
      alert('로그인 성공!');
    }
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
      </div>
    </div>
  );
}
