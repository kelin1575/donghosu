import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '동호수',
  description: '우리 단지 이야기',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} antialiased`}>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&libraries=services`}
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  )
}