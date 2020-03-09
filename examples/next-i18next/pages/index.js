import Head from 'next/head'
import { i18n, Link, withTranslation } from '../i18n'

const Index = ({t}) => (
  <>
    <Head>
      <title>next-pwa example</title>
    </Head>
    <h1>Next.js + PWA = {t('awesome').toLocaleUpperCase()}!</h1>
  </>
)

Index.getInitialProps = async () => ({
  namespacesRequired: ['common'],
})

export default withTranslation('common')(Index)
