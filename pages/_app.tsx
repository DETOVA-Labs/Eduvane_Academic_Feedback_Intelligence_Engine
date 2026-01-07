import React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Eduvane | Learning Intelligence</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Subject-agnostic learning intelligence platform." />
      </Head>
      <Component {...pageProps} />
    </>
  );
}