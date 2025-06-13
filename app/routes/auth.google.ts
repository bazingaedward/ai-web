import { getAuthenticator } from '~/services/auth.server';

export const loader = async ({ request, context }) => {
  const {authenticator} = getAuthenticator(context.cloudflare.env)
  return await authenticator.authenticate('google', request, {
    successRedirect: '/', // 登录成功后重定向的路径
    failureRedirect: '/login', // 登录失败后重定向的路径
  });
};
