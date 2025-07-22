// middleware.ts
import { withAuth } from 'next-auth/middleware';
import type { NextRequest } from 'next/server';

export default withAuth((req: NextRequest) => {}, {
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/settings/:path*', '/feedback/:path*'], // 로그인 필요 페이지 추가
};
