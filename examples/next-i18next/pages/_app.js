import React from 'react'
import { appWithTranslation } from '../i18n'

const App = ({ Component, pageProps }) => {
  return <Component {...pageProps} />
}

const AppWithTranslation = appWithTranslation(App)

export default AppWithTranslation
