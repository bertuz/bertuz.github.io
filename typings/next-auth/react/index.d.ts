import type {
  SessionProviderProps,
  UseSessionOptions,
} from 'next-auth/react/types';

import type { Session } from '../core';

import type { GetSessionParams, SessionContextValue } from 'next-auth/react';

export declare function getSession(
  params?: GetSessionParams
): Promise<Session | null>;

export declare function useSession<R extends boolean>(
  options?: UseSessionOptions<R>
): SessionContextValue<R>;

export declare function SessionProvider(
  props: SessionProviderProps
): JSX.Element;
