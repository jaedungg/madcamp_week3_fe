// src/context/UserContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type UserContextType = {
  userid: string;
  setUserid: (id: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userid, setUserid] = useState('');
  return (
    <UserContext.Provider value={{ userid, setUserid }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
