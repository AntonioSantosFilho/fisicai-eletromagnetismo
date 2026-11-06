import { ScrollViewStyleReset } from "expo-router/html";

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <title>FisicAI · Física no ensino médio</title>
        <meta name="theme-color" content="#F7F9FC" />
        <meta name="color-scheme" content="light" />
        <meta name="application-name" content="FisicAI" />
        <meta name="apple-mobile-web-app-title" content="FisicAI" />
        <link
          rel="icon"
          type="image/png"
          sizes="1024x1024"
          href="/branding/favicon.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="1024x1024"
          href="/branding/app-icon.png"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
:root { color-scheme: light; }
@supports (height: 100dvh) {
  html, body, #root { height: 100dvh; }
}
body {
  background-color: #F7F9FC;
  color: #202C38;
}`;
