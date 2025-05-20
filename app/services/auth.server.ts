import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import type { User } from '~/models/user.server'; // 你的用户模型类型
// import { createUser, getUserByGoogleId } from '~/models/user.server'; // 你的用户模型操作函数
import { sessionStorage } from '~/services/session.server'; // 你的会话管理

// 创建一个认证器实例，指定用户模型和会话存储
export const authenticator = new Authenticator<User>(sessionStorage);

// 创建 Google 策略
const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: 'https://bolt-efz.pages.dev/',
    scope: ['profile', 'email'], // 你希望从 Google 获取的用户信息权限
  },
  async ({ profile }) => {
    // 从 Google 个人资料中获取用户信息并查找或创建本地用户
    console.log(profile);
    // const email = profile.emails?.[0]?.value;
    // const name = profile.displayName;
    // const googleId = profile.id;

    // if (!email) {
    //   throw new Error('Google profile did not provide an email');
    // }

    // let user = await getUserByGoogleId(googleId);

    // if (!user) {
    //   user = await createUser({
    //     email,
    //     name,
    //     googleId,
    //     // ... 其他你需要的用户信息
    //   });
    // }

    // return user;
    return {
      name: 'xxx',
    };
  },
);

// 将 Google 策略注册到认证器
authenticator.use(googleStrategy, 'google');
