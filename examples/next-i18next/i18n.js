const NextI18Next = require('next-i18next').default

module.exports = new NextI18Next({
  otherLanguages: ['zh'],
  localeSubpaths: {
    en: 'en',
    zh: 'zh'
  }
})
