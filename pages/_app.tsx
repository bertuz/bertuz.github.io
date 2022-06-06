import '../styles/globals.css';

import * as ga from '../lib/google-analytics';

import Head from 'next/head';

import Script from 'next/script';

import { useRouter } from 'next/router';

import { useEffect } from 'react';

import { SessionProvider, useSession } from 'next-auth/react';

import type { MySession } from './api/auth/[...nextauth]';

import type { AuthenticatedPageConfig } from '../typings/next';

import type { NextPageWithConfig } from 'next';

import type { FC, ReactNode } from 'react';

import type { AppProps } from 'next/app';

type AuthProps = { children: ReactNode; config: AuthenticatedPageConfig };

const Auth: FC<AuthProps> = ({ children, config }) => {
  const { status, data } = useSession({ required: true });
  const sessionData = data as MySession;
  const router = useRouter();

  if (status === 'loading') {
    if (config.loading) {
      return config.loading;
    } else return <>⏳ One moment...</>;
  }

  if (config.scope && !sessionData.scope.includes(config.scope)) {
    router.push(config.unauthorizedUrl);
    return <></>;
  }

  return <>{children}</>;
};

type AppPropsWithConfig = AppProps & {
  Component: NextPageWithConfig;
};

const MyApp = ({ Component, pageProps }: AppPropsWithConfig): ReactNode => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ga.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Matteo Bertamini</title>
      </Head>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${process.env.NEXT_PUBLIC_MEASUREMENT_ID}');
        `}
      </Script>

      <SessionProvider session={pageProps.session}>
        {Component?.auth && Component.auth.scope !== null ? (
          <Auth config={Component.auth}>
            <Component {...pageProps} />
          </Auth>
        ) : (
          <Component {...pageProps} />
        )}
      </SessionProvider>
    </>
  );
};

export default MyApp;
