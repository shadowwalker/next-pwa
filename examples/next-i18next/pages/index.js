import Head from 'next/head'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

const Index = () => {
  const { t } = useTranslation('common')
  return (
    <>
      <Head>
        <title>next-pwa example</title>
      </Head>
      <h1>Next.js + PWA = {t('awesome').toLocaleUpperCase()}!</h1>
    </>
  )
}

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common']))
  }
})

export default Index
