import NextAuth, {
  type NextAuthOptions,
  type Session,
  type User,
} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userid: {
          label: '아이디',
          type: 'text',
          placeholder: 'Enter your userid',
        },
        passwd: {
          label: '비밀번호',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      async authorize(credentials): Promise<User | null> {
        // credentials가 undefined일 수 있으니 체크
        if (!credentials?.userid || !credentials?.passwd) return null;

        // 실제 백엔드 API 호출
        const res = await fetch('http://172.20.12.58:80/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userid: credentials.userid,
            passwd: credentials.passwd,
          }),
        });

        if (!res.ok) return null;

        const user = await res.json();

        if (user) {
          // user 객체 구조에 맞게 조정하세요
          return {
            id: user.userid as string,
            name: user.nickname as string,
            // ... 필요한 user 필드 추가
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt', // 반드시 리터럴 타입 'jwt' 사용
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.userid = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (token) {
        session.user = session.user || {};
        session.user.userid = (token.userid as string) ?? null;
        session.user.name = (token.name as string) ?? null;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
