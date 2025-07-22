'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useNickname } from '@/context/NicknameContext';
import { useProfileImage } from '@/context/ProfileImageContext';
import { UserOutlined } from '@ant-design/icons';

export default function Header() {
  const { data: session } = useSession();
  const { nickname } = useNickname();
  const { profileImageKey } = useProfileImage();

  const userid = session?.user?.userid || '';

  const profileImgSrc = userid
    ? `http://172.20.12.58:80/profile/${userid}?t=${profileImageKey}`
    : '/images/profile.jpg';

  return (
    <header className="fixed bg-indigo-600 top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-8 py-4">
      <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 relative overflow-hidden gap-2.5">
        <p className="flex-grow-0 flex-shrink-0 text-[32px] font-semibold text-left capitalize text-white">
          🎤
        </p>
      </div>
      <div className="flex justify-end items-center flex-grow-0 flex-shrink-0 relative gap-2.5 p-2.5">
        {userid ? (
          <>
            <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left capitalize text-white">
              {nickname || userid}
            </p>
            <img
              className="h-10 w-10 flex-grow-0 flex-shrink-0 rounded-full object-cover"
              src={profileImgSrc}
              alt="프로필 사진"
              onError={(e) => {
                // 프로필 이미지가 없을 때 기본 아이콘 표시 용 (선택사항)
                e.currentTarget.src = '/images/profile.jpg';
              }}
            />
          </>
        ) : (
          <UserOutlined style={{ color: 'white', fontSize: 24 }} />
        )}
      </div>
    </header>
  );
}
