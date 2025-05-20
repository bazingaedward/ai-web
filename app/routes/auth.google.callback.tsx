import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  // 处理 Google 登录回调，验证用户信息并创建/登录用户
  return await authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/login',
  });
};
