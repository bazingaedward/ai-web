import { createCookieSessionStorage } from "@remix-run/cloudflare";
import { Authenticator } from 'remix-auth';
import { GoogleStrategy } from 'remix-auth-google';
import type { User } from "~/models/user.server";

export function getAuthenticator(env: Record<string, string>) {
  const sessionStorage = createCookieSessionStorage({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60,
      path: "/",
      sameSite: "lax",
      secrets: [env.SESSION_SECRET],
      secure: true,
    },
  });

  const authenticator = new Authenticator<User>(sessionStorage);

  authenticator.use(new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://bolt-efz.pages.dev/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async ({ accessToken, refreshToken, extraParams, profile }) => {
      console.log(profile, accessToken, refreshToken, extraParams);
      return {};
    }
  ), 'google');

  return {
    authenticator,
    sessionStorage
  };
}
