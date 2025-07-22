// UserContext.tsx 예시 (닉네임 관리 추가)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UserContextValue {
  userid: string | null;
  nickname: string | null;
  setNickname: (nick: string) => void;
}

const UserContext = createContext<UserContextValue>({
  userid: null,
  nickname: null,
  setNickname: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [userid, setUserid] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUserid(session.user.userid || null);
      setNickname(session.user.name || null);
    } else {
      setUserid(null);
      setNickname(null);
    }
  }, [session]);

  return (
    <UserContext.Provider value={{ userid, nickname, setNickname }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
