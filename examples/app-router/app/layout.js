export const metadata = {
  applicationName: 'next-pwa example',
  title: 'next-pwa example',
  description: 'next-pwa with the Next.js App Router',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'next-pwa example'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/favicon.ico'
  }
}

export const viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  )
}
