import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  // 调用认证器发起 Google 登录流程
  return await authenticator.authenticate('google', request, {
    successRedirect: '/', // 登录成功后重定向的路径
    failureRedirect: '/login', // 登录失败后重定向的路径
  });
};
