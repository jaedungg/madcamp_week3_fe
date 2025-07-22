'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useProfileImage } from '@/context/ProfileImageContext';
import { useNickname } from '@/context/NicknameContext';
import { useRouter } from 'next/navigation';
import { UserOutlined } from '@ant-design/icons';


export default function Header() {
  
  const router = useRouter();
  const { data: session } = useSession();
  const { profileImageKey } = useProfileImage();
  const { nickname } = useNickname();

  const userid = session?.user?.userid || '';

  // 프로필 사진 URL + 캐시 무효화용 쿼리 파라미터
  const profileImgSrc = userid
    ? `http://172.20.12.58:80/profile/${userid}?t=${profileImageKey}`
    : '/images/profile.jpg';

  return (
    <header className="fixed bg-indigo-600 top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-6 py-4">
      <div 
        className="flex justify-center items-center relative overflow-hidden gap-2.5 cursor-pointer"
        onClick={() => router.push(`/signin`)}
      >
        <p className="flex-grow-0 flex-shrink-0 text-[32px] font-semibold text-left capitalize text-white">
          🎤
        </p>
      </div>
      <div 
      className="flex justify-end items-center flex-grow-0 flex-shrink-0 relative gap-2.5 p-2.5"
      onClick={() => router.push(`/settings`)}
      >
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
