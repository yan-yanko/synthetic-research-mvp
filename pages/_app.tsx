import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import '../styles/main.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Synthetic Research MVP</title>
      </Head>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </>
  );
} 