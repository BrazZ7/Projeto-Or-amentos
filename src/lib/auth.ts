import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { enforceRateLimit } from '@/lib/rate-limit';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credenciais',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Informe e-mail e senha.');
        }

        const email = credentials.email.toLowerCase().trim();

        // Duas chaves: por e-mail barra força bruta contra uma conta; por IP
        // barra o ataque que espalha uma senha comum por muitos e-mails, que
        // a chave por e-mail sozinha não pegaria.
        const forwarded = req?.headers?.['x-forwarded-for'];
        const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
        await enforceRateLimit('login', email);
        if (ip) await enforceRateLimit('login', `ip:${ip}`);

        const user = await prisma.user.findUnique({
          where: { email },
          include: { company: true },
        });

        if (!user) {
          throw new Error('E-mail ou senha inválidos.');
        }

        const passwordOk = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!passwordOk) {
          throw new Error('E-mail ou senha inválidos.');
        }

        if (!user.emailVerified) {
          throw new Error('Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          companyId: user.companyId,
          companyName: user.company.tradeName || user.company.legalName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.companyId = user.companyId;
        token.companyName = user.companyName;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.companyId = token.companyId as string;
        session.user.companyName = token.companyName as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
