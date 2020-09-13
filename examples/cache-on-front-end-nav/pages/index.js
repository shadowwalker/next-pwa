import Head from 'next/head'
import Link from 'next/link'

const Index = () => (
  <>
    <Head>
      <title>next-pwa example | Home</title>
    </Head>
    <h1>Next.js + PWA = AWESOME!</h1>
    <h2>
      <Link href='/'>Go to Home</Link>
    </h2>
    <h2>
      <Link href='/a'>Go to route /a</Link>
    </h2>
    <h2>
      <Link href='/b'>Go to route /b</Link>
    </h2>
  </>
)

export default Index
