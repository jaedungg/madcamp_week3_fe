'use client';
import { useSession, signOut } from 'next-auth/react';
import { useProfileImage } from '@/context/ProfileImageContext';
import { useNickname } from '@/context/NicknameContext';
import { useRouter } from 'next/navigation';
import {
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const { profileImageKey } = useProfileImage();
  const { nickname } = useNickname();

  const userid = session?.user?.userid || '';

  const profileImgSrc = userid
    ? `http://172.20.12.58:80/profile/${userid}?t=${profileImageKey}`
    : '/images/profile.jpg';

  const menu = (
    <Menu>
      <Menu.Item
        key="settings"
        icon={<SettingOutlined />}
        onClick={() => router.push('/settings')}
        style={{ padding: '6px 20px', fontSize: '16px' }} // 크기 조정
      >
        설정
      </Menu.Item>
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        onClick={() => signOut({ callbackUrl: '/signin' })}
        style={{ padding: '6px 20px', fontSize: '16px' }} // 크기 조정
      >
        로그아웃
      </Menu.Item>
    </Menu>

  );

  return (
    <header className="fixed bg-cyan-600 top-0 left-0 w-full h-16 z-50 flex items-center justify-between px-4 py-4">
      <div
        className="flex justify-center items-center relative overflow-hidden gap-2.5 cursor-pointer"
        onClick={() => router.push(`/signin`)}
      >
        <img
          className="h-10 object-contain"
          src="/images/logo_horizontal.png"
          alt="로고"
        />
      </div>
      <div className="flex justify-end items-center flex-grow-0 flex-shrink-0 relative gap-4">
        {userid ? (
          <Dropdown overlay={menu} trigger={['click']}>
            <div className="flex items-center gap-3 cursor-pointer">
              <p className="text-lg font-semibold text-white text-left">
                {nickname || userid}
              </p>
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={profileImgSrc}
                alt="프로필 사진"
                onError={(e) => {
                  e.currentTarget.src = '/images/profile.jpg';
                }}
              />
            </div>
          </Dropdown>
        ) : (
          <UserOutlined style={{ color: 'white', fontSize: 24 }} />
        )}
      </div>
    </header>
  );
}
