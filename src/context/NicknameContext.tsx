// src/context/NicknameContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

type NicknameContextType = {
  nickname: string;
  setNickname: (name: string) => void;
};

const NicknameContext = createContext<NicknameContextType | undefined>(
  undefined
);

export const NicknameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [nickname, setNickname] = useState('');

  // 세션 닉네임이 바뀌면 Context 닉네임 동기화
  useEffect(() => {
    if (session?.user?.name) setNickname(session.user.name);
    else setNickname('');
  }, [session?.user?.name]);

  return (
    <NicknameContext.Provider value={{ nickname, setNickname }}>
      {children}
    </NicknameContext.Provider>
  );
};

export const useNickname = () => {
  const context = useContext(NicknameContext);
  if (!context)
    throw new Error('useNickname must be used within a NicknameProvider');
  return context;
};
