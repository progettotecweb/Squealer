import { Header } from '@/components/Header/Header'
import { Footer } from '@/components/Footer/Footer'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { AnimatePresence } from 'framer-motion'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <AnimatePresence mode="wait">
        <Component {...pageProps} />
      </AnimatePresence>
      <Footer />
    </>)
}
