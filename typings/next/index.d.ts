import type { NextPage } from 'next';

export type AuthenticatedScope =
  | null
  | 'front/admin:access'
  | 'front/user:access';

export type AuthenticatedPageConfig = {
  scope: AuthenticatedScope;
  loading?: React.ReactElement;
  unauthorizedUrl: string;
};

export type AuthConfig =
  | {
      scope: null;
    }
  | AuthenticatedPageConfig;

declare module 'next' {
  export declare type NextPageWithConfig<
    P = Record<string, unknown>,
    IP = P
  > = NextPage<P, IP> & {
    auth?: AuthConfig;
  };
}
