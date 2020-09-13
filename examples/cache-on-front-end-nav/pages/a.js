import Head from 'next/head'
import Link from 'next/link'

const A = () => (
  <>
    <Head>
      <title>next-pwa example | Route a</title>
    </Head>
    <h1>This is route /a</h1>
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

export default A
