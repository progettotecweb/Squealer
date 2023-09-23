import type { AppProps } from 'next/app'
import "@/styles/globals.css"

import Header from "@/components/Header"
import Navbar from "@/components/Navbar"
import { AnimatePresence } from 'framer-motion'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <Component {...pageProps} />
      </AnimatePresence>
      <Navbar />
    </>)
}
