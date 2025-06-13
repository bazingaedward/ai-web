import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { useLoaderData } from '@remix-run/react';

type UserInfo = {
  displayName?: string;
  _json?: {
    picture?: string;
  };
};

export function Header() {
  const chat = useStore(chatStore);
  const userInfo = useLoaderData() as UserInfo;

  return (
    <header
      className={classNames(
        'flex items-center bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer justify-between w-full">
        <div className='inline-flex items-center gap-2'>
        <div className="i-ph:sidebar-simple-duotone text-xl" />

         <a href="/" className="text-2xl font-semibold text-accent flex items-center">
          Beaver.AI
        </a>
        </div>
      {
        userInfo && (
          <div className='flex items-center gap-2 ml-auto mr-4'>
            {userInfo._json?.picture && (
              <img
                loading="lazy"
                crossOrigin="anonymous"
                src={userInfo._json.picture}
                alt="User avatar"
                className="w-8 h-8 rounded-full "
              />
            )}
            <span className='c-white'>{userInfo.displayName || ''}</span>
          </div>
        )
      }
      </div>


      {chat.started && (
        <ClientOnly>
          {() => (
            <div className="mr-1">
              <HeaderActionButtons />
            </div>
          )}
        </ClientOnly>
      )}
    </header>
  );
}
