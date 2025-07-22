import React, { createContext, useContext, useState } from 'react';

type ProfileImageContextType = {
  profileImageKey: number;
  refreshProfileImage: () => void;
};

const ProfileImageContext = createContext<ProfileImageContextType>({
  profileImageKey: Date.now(),
  refreshProfileImage: () => {},
});

export const ProfileImageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profileImageKey, setProfileImageKey] = useState(Date.now());
  const refreshProfileImage = () => setProfileImageKey(Date.now());

  return (
    <ProfileImageContext.Provider
      value={{ profileImageKey, refreshProfileImage }}
    >
      {children}
    </ProfileImageContext.Provider>
  );
};

export const useProfileImage = () => useContext(ProfileImageContext);
