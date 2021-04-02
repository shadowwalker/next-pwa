import Head from 'next/head'
import Image from 'next/image'

const Index = () => (
  <>
    <Head>
      <title>next-pwa example</title>
    </Head>
    <Image
        alt="Next.js logo background"
        src="https://assets.vercel.com/image/upload/v1538361091/repositories/next-js/next-js-bg.png"
        width={1200}
        height={400}
    />
    <h1>Next.js + PWA = AWESOME!</h1>
    <Image alt="Vercel logo" src="/vercel.png" width={1000} height={1000} />
  </>
)

export default Index
