import type { NextPage } from 'n  ext';

export type AuthenticatedRole = 'admin' | 'user';
export type AuthRole = AuthenticatedRole | 'free';

export type AuthenticatedPageConfig = {
  role: AuthenticatedRole;
  loading?: React.ReactElement;
  unauthorizedUrl: string;
};

export type AuthConfig =
  | {
      role: 'free';
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
