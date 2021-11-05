import '../global.scss';
import * as React from 'react';
import Head from 'next/head';
import { NextSeo } from 'next-seo';
import Inspect from 'inspx';

const DEV = process.env.NODE_ENV !== 'production';

function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="inspx, inspect, layout, component, react" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <link rel="preload" href="/inter-var-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/GT-Walsheim-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/JetBrainsMono-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <meta name="msapplication-TileColor" content="#000" />
        <meta name="theme-color" content="#000" />
        <meta name="twitter:site" content="@raunofreiberg" />
        <meta name="twitter:creator" content="@raunofreiberg" />
        <meta name="twitter:card" content="summary_large_image" />
        {!DEV && <script async defer data-domain="inspx.rauno.xyz" src="https://plausible.io/js/plausible.js" />}
      </Head>
      <NextSeo
        title="inspx — pixel perfect layout inspection"
        description="Pixel perfect layout inspection."
        openGraph={{
          type: 'website',
          url: 'https://inspx.rauno.xyz',
          title: 'inspx',
          description: 'Pixel perfect layout inspection.',
          images: [
            {
              url: 'https://inspx.rauno.xyz/og.png',
              alt: 'inspx',
            },
          ],
        }}
      />
      <Inspect disabled={false}>
        <Component {...pageProps} />
      </Inspect>
    </>
  );
}

export default App;
