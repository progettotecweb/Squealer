export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

import Header from "@/components/Header"
import Navbar from "@/components/Navbar"

import "@/styles/globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body><Header />{children}<Navbar /></body>
    </html>
  )
}
