// src/context/NicknameContext.tsx
import React, { createContext, useContext, useState } from 'react';

type NicknameContextType = {
  nickname: string;
  setNickname: (name: string) => void;
};

const NicknameContext = createContext<NicknameContextType>({
  nickname: '',
  setNickname: () => {},
});

export const NicknameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [nickname, setNickname] = useState('');

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
