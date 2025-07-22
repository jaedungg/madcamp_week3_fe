// next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    userid?: string; // 여기에서 userid 추가
    profile_url?: string; // 그리고 profile_url 추가
  }
  interface Session {
    user: {
      userid?: string;
      profile_url?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userid?: string;
    profile_url?: string;
  }
}
