import Head from 'next/head'

export default () => (
  <>
    <Head>
      <title>next-pwa example</title>
    </Head>
    <h1>Next.js + PWA = AWESOME!</h1>
    <h2>Routes not cached will fallback to /_offline page</h2>
    <h2>Following image will fallback to placeholder when offline</h2>
    <img src='https://source.unsplash.com/600x400/?cat' />
  </>
)
