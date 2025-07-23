import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const PUBLIC_PATHS = [
  '/signin',
  '/signup',
  '/api', // API 접근 차단 원하지 않으면 이 라인 빼세요
  '/images', // 이미지 등 퍼블릭 파일 경로
  // 여기에 접근 허용하고 싶은 경로 추가
];

export async function middleware(req: NextRequest) {
  // 접근하려는 경로
  const { pathname } = req.nextUrl;

  // 퍼블릭 경로인지 검사: 퍼블릭 경로면 건드리지 않음
  if (
    PUBLIC_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + '/') // 하위 경로 포함하려면 이렇게
    )
  ) {
    return NextResponse.next();
  }

  // NextAuth JWT를 이용해 로그인 여부 판별
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 로그인 안 했다면 /signin으로 리디렉트
  if (!token) {
    // 기존 URL 기억해서 로그인 후 redirect하려면 추가 옵션 사용
    const signinUrl = req.nextUrl.clone();
    signinUrl.pathname = '/signin';
    signinUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return NextResponse.redirect(signinUrl);
  }

  // 로그인 상태라면 정상 통과
  return NextResponse.next();
}

// middleware가 동작할 경로 지정: 모든 경로 적용하되 public 제외
export const config = {
  matcher: [
    '/((?!_next|favicon.ico|images|api/auth|signin|signup).*)',
    // _next/static 등은 빼야함, 필요한 정적/퍼블릭 경로 추가
  ],
};
