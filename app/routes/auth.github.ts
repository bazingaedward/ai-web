import { createCookieSessionStorage, type LoaderFunction } from '@remix-run/cloudflare';
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import type { User } from '~/models/user.server';
import { isDev } from '~/utils/env';

export const loader: LoaderFunction = async ({ request, context }) => {
  const cloudflareEnv = context.cloudflare.env;
  const env = isDev() ? process.env : cloudflareEnv;
  // 调用认证器发起 Google 登录流程
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: '__session',
      secure: process.env.NODE_ENV === 'production',
      secrets: [env.SESSION_SECRET],
      sameSite: 'lax',
      httpOnly: true,
    },
  });

  const authenticator = new Authenticator<User>(sessionStorage);

  // 创建 Google 策略
  const googleStrategy = new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID!,
      clientSecret: env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'https://bolt-efz.pages.dev/',
      scope: ['profile', 'email'], // 你希望从 Google 获取的用户信息权限
    },
    async ({ profile }) => {
      // 从 Google 个人资料中获取用户信息并查找或创建本地用户
      console.log(profile);
      return {
        name: 'xxx',
      };
    },
  );

  // 将 Google 策略注册到认证器
  authenticator.use(googleStrategy, 'google');

  return await authenticator.authenticate('google', request, {
    successRedirect: '/', // 登录成功后重定向的路径
    failureRedirect: '/login', // 登录失败后重定向的路径
  });
};
