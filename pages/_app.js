import "@/styles/globals.css";
import Script from "next/script";
import Head from "next/head";
import ChatScriptLoader from "../component/ChatScript";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Character set and viewport */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Title and description */}
        <title>eToro: Your Wealth Platform for Digital Assets</title>
        <meta
          name="description"
          content="Discover eToro, the comprehensive platform that's driving the next generation of crypto wealth. Grow, trade, invest and earn on your digital assets."
        />
        <meta name="robots" content="index" />
        <meta
          name="insight-app-sec-validation"
          content="f859a4b1-3233-4fb9-98f5-1c9f7273379b"
        />

        {/* Open Graph tags */}
        <meta
          property="og:title"
          content="eToro: Your Wealth Platform for Digital Assets"
        />
        <meta
          property="og:description"
          content="Discover eToro, the comprehensive platform that's driving the next generation of crypto wealth. Grow, trade, invest and earn on your digital assets."
        />
        <meta property="og:url" content="https://etoro.com" />
        <meta property="og:site_name" content="eToro" />
        <meta
          property="og:image"
          content="https://marketing.etorostatic.com/cache1/hp/v_254/images/meta/etoro_logo_social_share_2025.png"
        />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="eToro: Your Wealth Platform for Digital Assets"
        />
        <meta
          name="twitter:description"
          content="Discover eToro, the comprehensive platform that's driving the next generation of crypto wealth. Grow, trade, invest and earn on your digital assets."
        />
        <meta
          name="twitter:image"
          content="https://marketing.etorostatic.com/cache1/hp/v_254/images/meta/etoro_logo_social_share_2025.png"
        />

        {/* Favicon */}
        <link
          rel="icon"
          href="/favicon.ico"
          type="image/x-icon"
          sizes="16x16"
        />
        <link
          rel="icon"
          href="/icon.svg?84665760bdc38c94"
          type="image/svg+xml"
          sizes="any"
        />
        <link
          rel="apple-touch-icon"
          content="https://marketing.etorostatic.com/cache1/hp/v_254/images/meta/etoro_logo_social_share_2025.png"
          type="image/png"
          sizes="180x180"
        />

        {/* Next.js internal tag */}
        <meta name="next-size-adjust" content="" />
      </Head>
      {/* <Script
        id="smartsupp"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = '141885de33485847ab14c75f14a29ca13b77c57d';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=document.getElementsByTagName('script')[0];
              c=document.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';
              s.parentNode.insertBefore(c,s);
            })(document);
          `,
        }}
      /> */}
      <ChatScriptLoader />

      <Component {...pageProps} />
    </>
  );
}
