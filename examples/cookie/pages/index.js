import Head from 'next/head'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'
import nextCookies from 'next-cookies'

export default ({ user }) => {
  const router = useRouter()

  const handleLogoutClick = () => {
    Cookies.remove('user')
    router.replace('/login')
  }

  const handleLoginClick = () => {
    router.replace('/login')
  }

  return (
    <>
      <Head>
        <title>next-pwa example</title>
      </Head>
      <h1>Next.js + PWA = AWESOME!</h1>
      {user ? (
        <>
          <h2>User ID: {user}</h2>
          <button onClick={handleLogoutClick}>Click to logout</button>
        </>
      ) : (
        <button onClick={handleLoginClick}>Click to login</button>
      )}
    </>
  )
}

export const getServerSideProps = context => {
  const { user } = nextCookies(context)
  if (!user) {
    console.log('❌ User Not Login, Redirect To Login Page')
    context.res.setHeader('location', '/login')
    context.res.statusCode = 302
    context.res.end()
    return { props: {} }
  } else {
    console.log(`✅ User (id=${user}) Already Login, Show Home Page.`)
    return {
      props: {
        user
      }
    }
  }
}
