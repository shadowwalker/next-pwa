import Head from 'next/head'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const Login = () => {
  const router = useRouter()

  const handleLoginClick = () => {
    Cookies.set('user', 'FakeUserID-0527VND927SDF', { expires: 30 })
    router.replace('/')
  }

  return (
    <>
      <Head>
        <title>Login | next-pwa example</title>
      </Head>
      <h1>Login Page</h1>
      <button onClick={handleLoginClick}>Click to login</button>
    </>
  )
}

export default Login
