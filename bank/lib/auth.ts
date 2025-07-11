import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "@/db";

function getAccountNumber(): string {
  const digits = "0123456789";
  const getRandomDigits = (len: number) =>
    Array.from({ length: len }, () => digits[Math.floor(Math.random() * digits.length)]).join("");
  return `${getRandomDigits(4)}-${getRandomDigits(4)}-${getRandomDigits(4)}-${getRandomDigits(4)}`;
}

const signinSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6).max(20),
});

const signupSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(6).max(20),
  name: z.string().min(1),
  email: z.string().email(),
});

const cookiePrefix = process.env.NODE_ENV === "production" ? "__Secure-" : "bank-";
const useSecureCookies = process.env.NODE_ENV === "production";

export const NEXT_AUTH : AuthOptions= {
  providers: [
    CredentialsProvider({
      id: "signin",
      name: "Sign In",
      credentials: {
        phone: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !signinSchema.safeParse(credentials).success) return null;

        const user = await prisma.user.findFirst({
          where: { number: credentials.phone },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;

        const account = await prisma.account.findFirst({ where: { userId: user.id } });

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          number: user.number,
          accountNumber: account?.accountNumber || "",
        };
      },
    }),
    CredentialsProvider({
      id: "signup",
      name: "Sign Up",
      credentials: {
        name: { label: "Name", type: "text" },
        phone: { label: "Phone Number", type: "text" },
        password: { label: "Password", type: "password" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials || !signupSchema.safeParse(credentials).success) return null;

        const existing = await prisma.user.findFirst({
          where: {
            OR: [{ number: credentials.phone }, { email: credentials.email }],
          },
        });
        if (existing) return null;

        const hashedPassword = await bcrypt.hash(credentials.password, 10);
        const user = await prisma.user.create({
          data: {
            name: credentials.name,
            email: credentials.email,
            number: credentials.phone,
            password: hashedPassword,
          },
        });

        const accountNumber = getAccountNumber();
        await prisma.account.create({
          data: {
            userId: user.id,
            accountNumber,
            amount: 20000000,
          },
        });

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          number: user.number,
          accountNumber,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
  // cookies: {
  //   sessionToken: {
  //     name: `${cookiePrefix}next-auth.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: useSecureCookies,
  //     },
  //   },
  //   callbackUrl: {
  //     name: `${cookiePrefix}next-auth.callback-url`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax" as const,
  //       path: "/",
  //       secure: useSecureCookies,
  //     },
  //   },
  //   csrfToken: {
  //     name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax" as const,
  //       path: "/",
  //       secure: useSecureCookies,
  //     },
  //   },
  //   pkceCodeVerifier: {
  //     name: `${cookiePrefix}next-auth.pkce.code_verifier`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax" as const,
  //       path: "/",
  //       secure: useSecureCookies,
  //       maxAge: 60 * 15,
  //     },
  //   },
  //   state: {
  //     name: `${cookiePrefix}next-auth.state`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax" as const,
  //       path: "/",
  //       secure: useSecureCookies,
  //       maxAge: 60 * 15,
  //     },
  //   },
  //   nonce: {
  //     name: `${cookiePrefix}next-auth.nonce`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax" as const,
  //       path: "/",
  //       secure: useSecureCookies,
  //     },
  //   },
  // },
  callbacks: {
    async jwt({ token, user }:any) {
      if (user) {
        token.phoneNumber = user.number;
        token.accountNumber = user.accountNumber;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user = {
        ...session.user,
        id: token.sub!,
        phoneNumber: token.phoneNumber,
        accountNumber: token.accountNumber,
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    newUser: "/auth/signup"
  }
};

