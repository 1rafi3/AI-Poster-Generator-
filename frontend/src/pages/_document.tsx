import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="bn">
      <Head>
        {/* Bangla fonts — preloaded globally so Canvas 2D drawText has them ready */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Hind+Siliguri:wght@400;500;600;700&family=Anek+Bangla:wght@400;600;700;800&display=swap"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
