import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import nextjsDark from '../images/nextjs-dark.svg'

const Index = () => (
  <>
    <Head>
      <title>next-pwa example</title>
    </Head>
    <h1>Next.js + PWA = AWESOME!</h1>
    <Image src={nextjsDark} width={504} height={300}/>
    <Link href='/about'>About</Link>
  </>
)

export default Index
