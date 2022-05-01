import '../styles/globals.css';
import * as ga from '../lib/google-analytics';

import Head from 'next/head';

import Script from 'next/script';

import { useRouter } from 'next/router';

import { useEffect } from 'react';

import { SessionProvider, useSession } from 'next-auth/react';

import type { AuthenticatedPageConfig } from '../typings/next';

import type { NextPageWithConfig } from 'next';

import type { FC, ReactNode } from 'react';

import type { AppProps } from 'next/app';

type AuthProps = { children: ReactNode; config: AuthenticatedPageConfig };
const Auth: FC<AuthProps> = ({ children, config }) => {
  const { status, data } = useSession({ required: true });
  const router = useRouter();

  if (status === 'loading') {
    if (config.loading) {
      return config.loading;
    } else return <>⏳ One moment...</>;
  }

  if (
    config.role === 'admin' &&
    data?.user?.id !== process.env.NEXT_PUBLIC_ADMIN_USER_ID
  ) {
    console.log('----');
    console.log(data?.user?.id);
    console.log(process.env.NEXT_PUBLIC_ADMIN_USER_ID);
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
  const isPrivate = (Component.auth?.role ?? 'free') !== 'free';

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
        {isPrivate ? (
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
