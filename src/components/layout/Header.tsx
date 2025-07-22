'use client';
import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import { useProfileImage } from '@/context/ProfileImageContext';
import { useNickname } from '@/context/NicknameContext';

export default function Header() {
  const { userid } = useUser();
  const { profileImageKey } = useProfileImage();
  const { nickname } = useNickname();

  // 프로필 사진 URL + 캐시 무효화용 쿼리 파라미터
  const profileImgSrc = userid
    ? `http://172.20.12.58:80/profile/${userid}?t=${profileImageKey}`
    : '/images/profile.jpg';

  return (
    <header className="fixed bg-indigo-600 top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-8 py-4">
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative overflow-hidden gap-2.5">
        <p className="flex-grow-0 flex-shrink-0 text-[32px] font-semibold text-left capsitalize text-white">
          🎤
        </p>
      </div>
      <div className="flex justify-end items-center flex-grow-0 flex-shrink-0 relative gap-2.5">
        <svg
          width={24}
          height={24}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
          preserveAspectRatio="none"
        >
          <path
            d="M12.0012 21.75C13.1012 21.75 14.0012 20.85 14.0012 19.75H10.0012C10.0012 20.85 10.8912 21.75 12.0012 21.75ZM18.0012 15.75V10.75C18.0012 7.68 16.3612 5.11 13.5012 4.43V3.75C13.5012 2.92 12.8312 2.25 12.0012 2.25C11.1712 2.25 10.5012 2.92 10.5012 3.75V4.43C7.63121 5.11 6.00121 7.67 6.00121 10.75V15.75L4.71121 17.04C4.08121 17.67 4.52121 18.75 5.41121 18.75H18.5812C19.4712 18.75 19.9212 17.67 19.2912 17.04L18.0012 15.75Z"
            fill="white"
          />
        </svg>
        <div className="flex justify-start items-center gap-6 flex-grow-0 flex-shrink-0 relative gap-2.5 p-2.5">
          {userid && (
            <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left capitalize text-white">
              {nickname || userid}
            </p>
          )}
          <img
            className="h-10 w-10 flex-grow-0 flex-shrink-0 rounded-full object-cover"
            src={profileImgSrc}
            alt="프로필 사진"
          />
        </div>
      </div>
    </header>
  );
}
