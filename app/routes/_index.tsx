import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';

export const loader = async ({context}) => {
  const res = await context.cloudflare.env.USER_LOGIN.get('user')
  // const res = {"provider":"google","id":"103738252342311937057","displayName":"邱凯翔","name":{"familyName":"邱","givenName":"凯翔"},"emails":[{"value":"bazingaedward@gmail.com"}],"photos":[{"value":"https://lh3.googleusercontent.com/a/ACg8ocLUgCdjsI2cF0HbR-Gamqc2XVk2059C2FqzRI8bm9oYrkhV5FLa=s96-c"}],"_json":{"sub":"103738252342311937057","name":"邱凯翔","given_name":"凯翔","family_name":"邱","picture":"https://lh3.googleusercontent.com/a/ACg8ocLUgCdjsI2cF0HbR-Gamqc2XVk2059C2FqzRI8bm9oYrkhV5FLa=s96-c","email":"bazingaedward@gmail.com","email_verified":true}}
  return json(res)
};

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full">
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
    </div>
  );
}
