import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en-US">
            <Head>
                <meta charSet="utf-8" />
                <meta name="author" content="Matteo Bertamini" />
                <meta name="description"
                      content="Matteo Bertamini's web page, fullstack developer. Living between Madrid and Italy." />
                <link rel="icon" href="/logo.ico" type="image/x-icon" />

                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <body>
            <Main />
            <NextScript />
            </body>
        </Html>
    )
}
