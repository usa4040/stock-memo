import { AuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        // 開発用: メールアドレスのみで認証（本番では OAuth を推奨）
        CredentialsProvider({
            name: "メールアドレス",
            credentials: {
                email: {
                    label: "メールアドレス",
                    type: "email",
                    placeholder: "example@example.com",
                },
            },
            async authorize(credentials) {
                if (!credentials?.email) {
                    return null;
                }

                // ユーザーを検索または作成
                let user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (!user) {
                    // 新規ユーザーを作成
                    user = await prisma.user.create({
                        data: {
                            email: credentials.email,
                            name: credentials.email.split("@")[0],
                        },
                    });
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            },
        }),
        // TODO: 本番環境では以下の OAuth プロバイダーを有効化
        // GoogleProvider({
        //   clientId: process.env.GOOGLE_CLIENT_ID!,
        //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        // }),
        // GitHubProvider({
        //   clientId: process.env.GITHUB_CLIENT_ID!,
        //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        // }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/auth/signin",
        // signOut: "/auth/signout",
        // error: "/auth/error",
    },
    debug: process.env.NODE_ENV === "development",
};
